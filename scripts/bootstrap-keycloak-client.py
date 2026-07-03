#!/usr/bin/env python3
from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

import requests


@dataclass
class Config:
    base_url: str
    realm: str
    admin_user: str
    admin_password: str
    client_id: str
    redirect_uri: str
    web_origin: str
    admin_group: str
    admin_usernames: list[str]


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default).strip()


def load_dotenv() -> None:
    path = Path(".env")
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


def load_config() -> Config:
    redirect_uri = env("HEADMASTER_AUTH_REDIRECT_URI")
    base_origin = redirect_uri.rsplit("/auth/callback", 1)[0] if "/auth/callback" in redirect_uri else redirect_uri.rstrip("/")
    return Config(
        base_url=env("KEYCLOAK_URL", "http://localhost:9004").rstrip("/"),
        realm=env("KEYCLOAK_REALM", "example"),
        admin_user=env("KC_ADMIN_USER", "admin"),
        admin_password=env("KC_ADMIN_PASSWORD"),
        client_id=env("HEADMASTER_AUTH_CLIENT_ID", "headmaster"),
        redirect_uri=redirect_uri,
        web_origin=env("HEADMASTER_PUBLIC_BASE_URL", base_origin),
        admin_group=env("HEADMASTER_AUTH_ADMIN_GROUP", "headscale-admins"),
        admin_usernames=[item for item in env("HEADMASTER_BOOTSTRAP_ADMIN_USERNAMES", "admin-1,admin-2").split(",") if item],
    )


class KeycloakAdmin:
    def __init__(self, config: Config) -> None:
        self.config = config
        self.session = requests.Session()
        self.token = ""

    def authenticate(self) -> None:
        response = requests.post(
            f"{self.config.base_url}/realms/master/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": "admin-cli",
                "username": self.config.admin_user,
                "password": self.config.admin_password,
            },
            timeout=20,
        )
        response.raise_for_status()
        self.token = response.json()["access_token"]
        self.session.headers.update(
            {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            }
        )

    def get(self, path: str, **kwargs):
        response = self.session.get(f"{self.config.base_url}{path}", timeout=20, **kwargs)
        response.raise_for_status()
        return response

    def post(self, path: str, **kwargs):
        response = self.session.post(f"{self.config.base_url}{path}", timeout=20, **kwargs)
        response.raise_for_status()
        return response

    def put(self, path: str, **kwargs):
        response = self.session.put(f"{self.config.base_url}{path}", timeout=20, **kwargs)
        response.raise_for_status()
        return response

    def ensure_group(self, name: str) -> dict:
        groups = self.get(f"/admin/realms/{self.config.realm}/groups", params={"briefRepresentation": "false"}).json()
        for group in groups:
          if group["name"] == name:
            return group
        self.post(f"/admin/realms/{self.config.realm}/groups", json={"name": name})
        groups = self.get(f"/admin/realms/{self.config.realm}/groups", params={"briefRepresentation": "false"}).json()
        for group in groups:
          if group["name"] == name:
            return group
        raise RuntimeError(f"Failed to create group {name}")

    def ensure_client(self) -> dict:
        clients = self.get(f"/admin/realms/{self.config.realm}/clients", params={"clientId": self.config.client_id}).json()
        payload = {
            "clientId": self.config.client_id,
            "name": "Headmaster",
            "enabled": True,
            "protocol": "openid-connect",
            "publicClient": False,
            "clientAuthenticatorType": "client-secret",
            "standardFlowEnabled": True,
            "directAccessGrantsEnabled": False,
            "serviceAccountsEnabled": False,
            "redirectUris": [self.config.redirect_uri],
            "webOrigins": [self.config.web_origin],
            "attributes": {
                "post.logout.redirect.uris": "+",
                "pkce.code.challenge.method": "S256",
            },
        }
        if clients:
            client = clients[0]
            merged = {**client, **payload}
            self.put(f"/admin/realms/{self.config.realm}/clients/{client['id']}", json=merged)
            return self.get(f"/admin/realms/{self.config.realm}/clients/{client['id']}").json()
        response = self.post(f"/admin/realms/{self.config.realm}/clients", json=payload)
        client_id = response.headers["Location"].rstrip("/").split("/")[-1]
        return self.get(f"/admin/realms/{self.config.realm}/clients/{client_id}").json()

    def ensure_group_mapper(self, client_internal_id: str) -> None:
        path = f"/admin/realms/{self.config.realm}/clients/{client_internal_id}/protocol-mappers/models"
        mappers = self.get(path).json()
        payload = {
            "name": "headmaster-groups",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-group-membership-mapper",
            "config": {
                "access.token.claim": "true",
                "claim.name": "groups",
                "full.path": "false",
                "id.token.claim": "true",
                "introspection.token.claim": "true",
                "userinfo.token.claim": "true",
            },
        }
        for mapper in mappers:
            if mapper["name"] == payload["name"]:
                payload["id"] = mapper["id"]
                self.put(f"{path}/{mapper['id']}", json=payload)
                return
        self.post(path, json=payload)

    def get_client_secret(self, client_internal_id: str) -> str:
        response = self.get(
            f"/admin/realms/{self.config.realm}/clients/{client_internal_id}/client-secret"
        )
        return response.json()["value"]

    def get_user(self, username: str) -> dict | None:
        users = self.get(
            f"/admin/realms/{self.config.realm}/users",
            params={"username": username, "exact": "true", "max": 50},
        ).json()
        return users[0] if users else None

    def join_group(self, user_id: str, group_id: str) -> None:
        self.put(f"/admin/realms/{self.config.realm}/users/{user_id}/groups/{group_id}")


def main() -> None:
    load_dotenv()
    config = load_config()
    if not config.admin_password:
        raise SystemExit("KC_ADMIN_PASSWORD is required")
    if not config.redirect_uri:
        raise SystemExit("HEADMASTER_AUTH_REDIRECT_URI is required")

    admin = KeycloakAdmin(config)
    admin.authenticate()
    group = admin.ensure_group(config.admin_group)
    client = admin.ensure_client()
    admin.ensure_group_mapper(client["id"])

    for username in config.admin_usernames:
        user = admin.get_user(username)
        if user:
            admin.join_group(user["id"], group["id"])

    print(
        json.dumps(
            {
                "realm": config.realm,
                "client_id": config.client_id,
                "client_secret": admin.get_client_secret(client["id"]),
                "admin_group": config.admin_group,
                "redirect_uri": config.redirect_uri,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
