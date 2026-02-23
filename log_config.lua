local log_config = {}

--- @type "Discord" | "FiveManage" | "OX Lib" | false
log_config.LoggingService = "Discord"   -- Discord, FiveManage, OX Lib or false

log_config.FiveManageDataset = nil      -- if FiveManage is the LoggingService, this is were logs are saved if not provided used default

log_config.DiscordWebhooks = {          -- Required if Discord is the LoggingService
    biometrics = "",
    citizens = "",
    wiretap = "",
    evidences = "",
    scanner = "",
    evidence_box = ""
}

return log_config