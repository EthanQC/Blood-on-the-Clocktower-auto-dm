// Package docs provides the Swagger documentation for the API.
package docs

import "github.com/swaggo/swag"

const docTemplate = `{
    "schemes": {{ marshal .Schemes }},
    "swagger": "2.0",
    "info": {
        "description": "{{escape .Description}}",
        "title": "{{.Title}}",
        "contact": {
            "name": "API Support",
            "url": "https://github.com/qingchang/Blood-on-the-Clocktower-auto-dm"
        },
        "license": {
            "name": "MIT",
            "url": "https://opensource.org/licenses/MIT"
        },
        "version": "{{.Version}}"
    },
    "host": "{{.Host}}",
    "basePath": "{{.BasePath}}",
    "paths": {
        "/health": {
            "get": {
                "description": "Returns server health status",
                "produces": ["text/plain"],
                "tags": ["System"],
                "summary": "Health check endpoint",
                "responses": {
                    "200": {
                        "description": "ok",
                        "schema": {"type": "string"}
                    }
                }
            }
        },
        "/v1/auth/register": {
            "post": {
                "description": "Create a new user account and return JWT token",
                "consumes": ["application/json"],
                "produces": ["application/json"],
                "tags": ["Authentication"],
                "summary": "Register a new user",
                "parameters": [{
                    "description": "Registration details",
                    "name": "request",
                    "in": "body",
                    "required": true,
                    "schema": {"$ref": "#/definitions/RegisterRequest"}
                }],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {"$ref": "#/definitions/AuthResponse"}
                    },
                    "400": {"description": "invalid json"},
                    "409": {"description": "user exists or db error"}
                }
            }
        },
        "/v1/auth/login": {
            "post": {
                "description": "Authenticate user and return JWT token",
                "consumes": ["application/json"],
                "produces": ["application/json"],
                "tags": ["Authentication"],
                "summary": "User login",
                "parameters": [{
                    "description": "Login credentials",
                    "name": "request",
                    "in": "body",
                    "required": true,
                    "schema": {"$ref": "#/definitions/LoginRequest"}
                }],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {"$ref": "#/definitions/AuthResponse"}
                    },
                    "400": {"description": "invalid json"},
                    "401": {"description": "invalid credentials"}
                }
            }
        },
        "/v1/rooms": {
            "post": {
                "security": [{"BearerAuth": []}],
                "description": "Create a new Blood on the Clocktower game room",
                "produces": ["application/json"],
                "tags": ["Rooms"],
                "summary": "Create a new game room",
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {"$ref": "#/definitions/CreateRoomResponse"}
                    },
                    "401": {"description": "unauthorized"},
                    "500": {"description": "db error"}
                }
            }
        },
        "/v1/rooms/{room_id}/join": {
            "post": {
                "security": [{"BearerAuth": []}],
                "description": "Join a Blood on the Clocktower game room as a player",
                "produces": ["application/json"],
                "tags": ["Rooms"],
                "summary": "Join an existing game room",
                "parameters": [{
                    "type": "string",
                    "description": "Room ID",
                    "name": "room_id",
                    "in": "path",
                    "required": true
                }],
                "responses": {
                    "200": {
                        "description": "OK",
                        "schema": {"$ref": "#/definitions/JoinRoomResponse"}
                    },
                    "401": {"description": "unauthorized"},
                    "404": {"description": "room not found"}
                }
            }
        },
        "/v1/rooms/{room_id}/events": {
            "get": {
                "security": [{"BearerAuth": []}],
                "description": "Retrieve events from a room for state synchronization (supports last_seq incremental sync)",
                "produces": ["application/json"],
                "tags": ["Events"],
                "summary": "Fetch room events",
                "parameters": [
                    {"type": "string", "description": "Room ID", "name": "room_id", "in": "path", "required": true},
                    {"type": "integer", "description": "Fetch events after this sequence number", "name": "after_seq", "in": "query"}
                ],
                "responses": {
                    "200": {"description": "OK", "schema": {"type": "array", "items": {"$ref": "#/definitions/StoredEvent"}}},
                    "401": {"description": "unauthorized"},
                    "403": {"description": "forbidden"}
                }
            }
        },
        "/v1/rooms/{room_id}/state": {
            "get": {
                "security": [{"BearerAuth": []}],
                "description": "Retrieve current game state with visibility projection based on user role",
                "produces": ["application/json"],
                "tags": ["State"],
                "summary": "Fetch room state",
                "parameters": [
                    {"type": "string", "description": "Room ID", "name": "room_id", "in": "path", "required": true}
                ],
                "responses": {
                    "200": {"description": "OK", "schema": {"$ref": "#/definitions/GameState"}},
                    "401": {"description": "unauthorized"},
                    "403": {"description": "forbidden"},
                    "500": {"description": "room error"}
                }
            }
        },
        "/v1/rooms/{room_id}/replay": {
            "get": {
                "security": [{"BearerAuth": []}],
                "description": "Rebuild game state up to a specific sequence number for replay/debugging",
                "produces": ["application/json"],
                "tags": ["Events"],
                "summary": "Replay game to specific point",
                "parameters": [
                    {"type": "string", "description": "Room ID", "name": "room_id", "in": "path", "required": true},
                    {"type": "integer", "description": "Replay up to this sequence number", "name": "to_seq", "in": "query"},
                    {"type": "string", "description": "View state as specific user", "name": "viewer", "in": "query"}
                ],
                "responses": {
                    "200": {"description": "OK", "schema": {"$ref": "#/definitions/GameState"}},
                    "401": {"description": "unauthorized"},
                    "403": {"description": "forbidden"}
                }
            }
        },
        "/ws": {
            "get": {
                "description": "Establish WebSocket connection for real-time game events. Pass token as query param: /ws?token={jwt}",
                "tags": ["WebSocket"],
                "summary": "WebSocket connection endpoint",
                "parameters": [
                    {"type": "string", "description": "JWT token", "name": "token", "in": "query", "required": true}
                ],
                "responses": {
                    "101": {"description": "Switching Protocols"},
                    "401": {"description": "unauthorized"}
                }
            }
        }
    },
    "definitions": {
        "RegisterRequest": {
            "type": "object",
            "required": ["email", "password"],
            "properties": {
                "email": {"type": "string", "example": "user@example.com"},
                "password": {"type": "string", "example": "password123"}
            }
        },
        "LoginRequest": {
            "type": "object",
            "required": ["email", "password"],
            "properties": {
                "email": {"type": "string", "example": "user@example.com"},
                "password": {"type": "string", "example": "password123"}
            }
        },
        "AuthResponse": {
            "type": "object",
            "properties": {
                "token": {"type": "string", "example": "eyJhbGciOiJIUzI1NiIs..."},
                "user_id": {"type": "string", "example": "550e8400-e29b-41d4-a716-446655440000"}
            }
        },
        "CreateRoomResponse": {
            "type": "object",
            "properties": {
                "room_id": {"type": "string", "example": "550e8400-e29b-41d4-a716-446655440000"}
            }
        },
        "JoinRoomResponse": {
            "type": "object",
            "properties": {
                "status": {"type": "string", "example": "joined"}
            }
        },
        "StoredEvent": {
            "type": "object",
            "properties": {
                "room_id": {"type": "string"},
                "seq": {"type": "integer"},
                "event_id": {"type": "string"},
                "event_type": {"type": "string"},
                "actor_user_id": {"type": "string"},
                "causation_command_id": {"type": "string"},
                "payload_json": {"type": "string"},
                "server_ts": {"type": "string", "format": "date-time"}
            }
        },
        "GameState": {
            "type": "object",
            "properties": {
                "room_id": {"type": "string"},
                "phase": {"type": "string", "enum": ["lobby", "first_night", "day", "night", "ended"]},
                "day_number": {"type": "integer"},
                "players": {"type": "object", "additionalProperties": {"$ref": "#/definitions/Player"}},
                "nomination": {"$ref": "#/definitions/Nomination"},
                "last_seq": {"type": "integer"}
            }
        },
        "Player": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "name": {"type": "string"},
                "role": {"type": "string"},
                "true_role": {"type": "string"},
                "team": {"type": "string"},
                "alive": {"type": "boolean"},
                "seat_number": {"type": "integer"},
                "has_nominated": {"type": "boolean"},
                "was_nominated": {"type": "boolean"},
                "ghost_vote_available": {"type": "boolean"}
            }
        },
        "Nomination": {
            "type": "object",
            "properties": {
                "nominator": {"type": "string"},
                "nominee": {"type": "string"},
                "votes_for": {"type": "integer"},
                "votes_against": {"type": "integer"},
                "resolved": {"type": "boolean"}
            }
        }
    },
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "Enter 'Bearer {token}' to authorize"
        }
    }
}`

// SwaggerInfo holds exported Swagger Info.
var SwaggerInfo = &swag.Spec{
	Version:          "1.0",
	Host:             "localhost:8080",
	BasePath:         "/",
	Schemes:          []string{"http", "https"},
	Title:            "Blood on the Clocktower Auto-DM API",
	Description:      "AI-powered Storyteller backend for Blood on the Clocktower game. Supports real-time WebSocket connections, event sourcing, and multi-agent AI system.",
	InfoInstanceName: "swagger",
	SwaggerTemplate:  docTemplate,
}

func init() {
	swag.Register(SwaggerInfo.InstanceName(), SwaggerInfo)
}
