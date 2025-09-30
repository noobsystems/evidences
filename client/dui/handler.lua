require "client.dui.focus"
require "client.dui.laptops.item"
require "client.dui.laptops.sync"
require "client.dui.laptops.target"

local dui <const> = require "client.dui.dui"
local texture <const> = require "client.dui.laptops.texture.texture"

-- render the dui on the laptop's screen
texture.replace("script_rt_tvscreen", dui.dictName, dui.txtName)