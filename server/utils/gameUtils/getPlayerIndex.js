function getPlayerIndex(lobbyMembers, name) {
  return lobbyMembers.findIndex((p) => p.name === name);
}

module.exports.getPlayerIndex = getPlayerIndex;
