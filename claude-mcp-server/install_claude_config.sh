#!/bin/bash

# Configuration installer for Claude Desktop MCP Server
CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"
SOURCE_CONFIG="/Users/mohammedsinan/Campus-Career-AI-Platform/claude-mcp-server/claude_desktop_config.json"

mkdir -p "$CONFIG_DIR"

if [ -f "$CONFIG_FILE" ]; then
    echo "Existing Claude config found. Backing up to claude_desktop_config.json.bak..."
    cp "$CONFIG_FILE" "$CONFIG_FILE.bak"
    # Merge using node
    node -e '
      const fs = require("fs");
      const existing = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
      const incoming = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
      existing.mcpServers = existing.mcpServers || {};
      existing.mcpServers["campus-career-server"] = incoming.mcpServers["campus-career-server"];
      fs.writeFileSync(process.argv[1], JSON.stringify(existing, null, 2));
      console.log("Successfully merged campus-career-server into Claude Desktop config!");
    ' "$CONFIG_FILE" "$SOURCE_CONFIG"
else
    cp "$SOURCE_CONFIG" "$CONFIG_FILE"
    echo "Created new Claude Desktop config at $CONFIG_FILE"
fi

echo "Done! Please restart Claude Desktop application to load the new tools."
