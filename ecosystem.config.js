module.exports = {
    apps : [{
        name   : "Heresy",
        script : "./startup.sh",
        cron_restart: "1 0 * * *"
    }]
}