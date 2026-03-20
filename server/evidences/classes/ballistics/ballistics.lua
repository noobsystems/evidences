local ballistics = lib.class("ballistics", require "server.evidences.classes.evidence")
ballistics.superClassName = "ballistics"

function ballistics:constructor(owner)
    self:super(owner)
end

return ballistics