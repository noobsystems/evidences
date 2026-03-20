local casing = lib.class("casing", require "server.evidences.classes.ballistics.ballistics")
casing.superClassName = "ballistics"

function casing:constructor(serial)
    self:super(serial)
end

return casing