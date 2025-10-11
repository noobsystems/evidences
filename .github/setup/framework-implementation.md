### You can implement other frameworks or your own system easily:

Create a new folder at `evidences/common/frameworks` named after your framework and then create a `server.lua` and a `client.lua` file inside it. Copy and paste the following template code to this files and implement the functions:
   
```lua
-- client.lua
local framework <const> = {}

---@return table containing the first and lastName of the local player as strings
function framework.getPlayerName()
    -- call your framework's functions that retrieve the player's name here
    return {
        firstName = "John",
        lastName = "Doe"
    }
end

--- Returns the player's grade within their current job
---@param job string The name of the job (e.g. "police")
---@return number The player's grade of the job
function framework.getGrade(job)
    -- check if the player has the given job and return their grade in that job
    -- return nil if the player doesn't have the job
    local grade = 0
    return grade
end

return framework
```

```lua
-- server.lua
local framework <const> = {}

---@param playerId number The player's server id also refered to as source
---@return the unique identifier of the current character the player has selected
function framework.getIdentifier(playerId)
    local charId = ""
    return charId
end

return framework
```

Finally add a new entry to the `supportedFrameworks` table in `evidences/common/frameworks/framework.lua`:
```lua
local supportedFrameworks <const> = {
    -- the key has to be the name your framework's script (e.g. "es_extended" for ESX)
    -- the value has to be the name of the folder you previously created inside evidences/frameworks folder (we chose to name it "esx" for example)
    ["your_framework"] = "your_folder",
    ["es_extended"] = "esx",
    ...
}
```
