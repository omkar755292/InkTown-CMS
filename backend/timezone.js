function configTimezone ( timezone )
{
    process.env.TZ = timezone;
}

module.exports = { configTimezone };
