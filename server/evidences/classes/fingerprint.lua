local FINGERPRINT = lib.class("FINGERPRINT", require "server.evidences.classes.evidence")

function FINGERPRINT:constructor(owner)
    self:super(owner)
end

FINGERPRINT.superClassName = "FINGERPRINT"
return FINGERPRINT