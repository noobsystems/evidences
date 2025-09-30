local supportedFrameworks <const> = {
    ["es_extended"] = "esx",
    ["ND_Core"] = "nd",
    ["ox_core"] = "ox",
    ["qb-core"] = "qb",
    ["qbx_core"] = "qbx"
}

for resource, framework in pairs(supportedFrameworks) do
    if GetResourceState(resource):find("start") then
        return require(("common.frameworks.%s.%s"):format(framework, lib.context))
    end
end

lib.print.error("No supported framework.")
return nil