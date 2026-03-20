local bullet = lib.class("bullet", require "server.evidences.classes.ballistics.ballistics")
bullet.superClassName = "ballistics"

function bullet:constructor(serial)
    self:super(serial)
end

return bullet