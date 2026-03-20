local magazine = lib.class("magazine", require "server.evidences.classes.ballistics.ballistics")
magazine.superClassName = "ballistics"

function magazine:constructor(serial)
    self:super(serial)
end

return magazine