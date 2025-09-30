MySQL.query.await([[CREATE TABLE IF NOT EXISTS evidence_laptops (
    x VARCHAR(50) NOT NULL,
    y VARCHAR(50) NOT NULL,
    z VARCHAR(50) NOT NULL,
    w VARCHAR(50) NOT NULL
)]])

lib.callback.register("evidences:laptops:select", function(source)
    local response <const> = MySQL.query.await("SELECT * FROM evidence_laptops")
    local result = {}

    for _, coords in pairs(response) do
        local converted <const> = {
            x = tonumber(coords.x),
            y = tonumber(coords.y),
            z = tonumber(coords.z),
            w = tonumber(coords.w)
        }
        table.insert(result, converted)
    end

    return result
end)

lib.callback.register("evidences:laptops:place", function(source, coords)
    --local success <const> = database.insertEvidenceLaptop(coords)
    local success <const> = MySQL.insert.await("INSERT INTO evidence_laptops (x, y, z, w) VALUES (?, ?, ?, ?)", {
        tostring(coords.x), 
        tostring(coords.y), 
        tostring(coords.z), 
        tostring(coords.w)
    }) and true or false

    if success then
        TriggerClientEvent("evidences:client:spawnLaptops", -1, coords)
    end

    return success
end)

lib.callback.register("evidences:laptops:pickup", function(source, coords)
    if MySQL.update.await("DELETE FROM evidence_laptops WHERE x = ? AND y = ? AND z = ? AND w = ?", {
        tostring(coords.x), 
        tostring(coords.y), 
        tostring(coords.z), 
        tostring(coords.w) 
    }) > 0 then
        local success <const> = exports.ox_inventory:AddItem(source, "evidence_laptop", 1)

        if success then
            TriggerClientEvent("evidences:client:destroyLaptop", -1, coords)
        end

        return success
    end

    return false
end)