local BLOOD = lib.class("BLOOD", require "server.evidences.classes.dna.dna")

function BLOOD:constructor(owner)
    self:super(owner)
end

BLOOD.superClassName = "DNA"
return BLOOD