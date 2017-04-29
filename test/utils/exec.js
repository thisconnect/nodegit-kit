const { exec } = require('child_process')

module.exports = (command, options = {}) => {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        return reject(error)
      }
      if (options.cwd) {
        return resolve(stdout.replace(`${options.cwd}/`, '').trim())
      }
      resolve(stdout.trim())
    })
  })
}
