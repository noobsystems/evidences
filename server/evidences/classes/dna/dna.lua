local DNA = lib.class("DNA", require "server.evidences.classes.evidence")

function DNA:constructor(owner)
    self:super(owner)
end

DNA.superClassName = "DNA"
return DNA