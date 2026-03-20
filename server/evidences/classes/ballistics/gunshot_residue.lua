local config <const> = require "config"
local gunshot_residues = {}

local gunshotResidue = lib.class("gunshot_residue", require "server.evidences.classes.ballistics.ballistics")
gunshotResidue.superClassName = "ballistics"

function gunshotResidue:constructor(data)
    local serial, player

    if type(data) == "table" then
        serial, player = table.unpack(data)
    else
        serial = data
    end

    self:super(serial)

    if player then
        gunshot_residues[tonumber(player)] = gunshot_residues[tonumber(player)] or {}
        gunshot_residues[tonumber(player)][serial] = self
    end
end

if config.gunshotResidues.decayCron then
    lib.cron.new(config.gunshotResidues.decayCron, function(task, date)
        for player, residues in pairs(gunshot_residues) do
            for _, residue in pairs(residues) do
                residue:removeFromPlayer(player)
            end
        end
    end)
end

return gunshotResidue