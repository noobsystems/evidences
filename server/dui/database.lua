local database = {}

local allowedTypes <const> = { "fingerprint", "dna" }

MySQL.query.await([[CREATE TABLE IF NOT EXISTS stored_fingerprint (
    fingerprint VARCHAR(16) PRIMARY KEY NOT NULL,
    firstname TEXT DEFAULT NULL,
    lastname TEXT DEFAULT NULL,
    birthdate TEXT DEFAULT NULL,
    FOREIGN KEY (fingerprint) REFERENCES biometric_data(fingerprint)
)]])

MySQL.query.await([[CREATE TABLE IF NOT EXISTS stored_dna (
    dna VARCHAR(16) PRIMARY KEY NOT NULL,
    firstname TEXT DEFAULT NULL,
    lastname TEXT DEFAULT NULL,
    birthdate TEXT DEFAULT NULL,
    FOREIGN KEY (dna) REFERENCES biometric_data(dna)
)]])

function database.storePersonalDataForBiometricData(type, biometricData, firstname, lastname, birthdate)
    if not lib.table.contains(allowedTypes, type) then return nil end

    if not firstname and not lastname and not birthdate then
        MySQL.update.await(string.format("DELETE FROM stored_%s WHERE %s = ?", type, type), { biometricData })
        return
    end

    if firstname == "" and lastname == "" and birthdate == "" then
        MySQL.update.await(string.format("DELETE FROM stored_%s WHERE %s = ?", type, type), { biometricData })
        return
    end

    MySQL.insert.await(
        string.format([[
            INSERT INTO stored_%s (%s, firstname, lastname, birthdate)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                firstname = ?,
                lastname = ?,
                birthdate = ?
        ]], type, type),
        { biometricData, firstname, lastname, birthdate, firstname, lastname, birthdate })
end

function database.getPersonalDataByBiometricData(type, biometricData)
    if not lib.table.contains(allowedTypes, type) then return nil end
    return MySQL.prepare.await("SELECT * FROM stored_" .. type .. " WHERE " .. type .. " = ?", { biometricData })
end

function database.getStoredBiometricDataEntries(types, search, page)
    local statements, params = {}, {}
    local entriesPerPage <const> = 5

    search = search or ""
    local pattern <const> = "%" .. search:gsub("\\", "\\\\"):gsub("%%", "\\%%"):gsub("_", "\\_") .. "%"
    
    for _, type in ipairs(types or {}) do
        if lib.table.contains(allowedTypes, type) then
            statements[#statements + 1] = string.format([[
                SELECT 
                    %s AS `identifier`,
                    firstname,
                    lastname,
                    birthdate,
                    '%s' AS type
                FROM stored_%s
                WHERE (
                    %s LIKE ? OR
                    birthdate LIKE ? OR
                    CONCAT_WS(' ', firstname, lastname) LIKE ? OR
                    CONCAT_WS(' ', lastname, firstname) LIKE ?
                )
            ]], type, type, type, type)

            params[#params + 1] = pattern
            params[#params + 1] = pattern
            params[#params + 1] = pattern
            params[#params + 1] = pattern
        end
    end

    if #statements == 0 then
        return {
            entries = {},
            maxPages = 1,
            currentPage = 1
        }
    end

    local query <const> = table.concat(statements, "\nUNION ALL\n")

    page = page or 1
    local totalCount <const> = MySQL.scalar.await("SELECT COUNT(*) AS total_count FROM (" .. query .. ") AS sub", params) or 0

    params[#params + 1] = entriesPerPage
    params[#params + 1] = (page - 1) * entriesPerPage
    local entries <const> = MySQL.query.await(query .. " ORDER BY lastname, firstname, birthdate LIMIT ? OFFSET ?", params) or {}

    return {
        entries = entries,
        maxPages = math.max(1, math.ceil(totalCount / entriesPerPage)),
        currentPage = page
    }
end

return database