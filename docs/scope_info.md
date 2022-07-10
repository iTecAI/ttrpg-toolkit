# Scope/System Information

_So I don't go actually insane_

## Server Info

- Database: MongoDB
- Auth:
  - Username/Password, internal management
  - API Key further down the road, for interface tools
- Self-hosting:
  - Should be dockerized
  - Load plugin & config data from external volume
  - Configured via standard JSON. Config values may be linked to environment vars

## Client Info

- Baseline runs in React/TS
- Plugins do not add code to the client; The client API should handle all trivial plugin customization.
- Icons pulled from [react-icons](https://react-icons.github.io/react-icons/)
- MUI as base UI framework
- threeJS for 3D content, if any
- Mainly a web app, might extend to Electron later if possible
