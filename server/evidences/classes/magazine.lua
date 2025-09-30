local MAGAZINE = lib.class("MAGAZINE", require "server.evidences.classes.evidence")

function MAGAZINE:constructor(serial)
    self:super(serial)
end

MAGAZINE.superClassName = "MAGAZINE"
return MAGAZINE