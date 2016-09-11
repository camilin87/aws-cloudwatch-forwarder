module.exports = (env) => {
    if (!env){
        env = process.env
    }

    return {
        read: () => {
            return {}
        }
    }
}