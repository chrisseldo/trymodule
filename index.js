#!/usr/bin/env node
var repl = require('repl')
var npmi = require('npmi')
var path = require('path')
var colors = require('colors')

const TRYMODULE_PATH = path.resolve((process.env.HOME || process.env.USERPROFILE), '.trymodule')

var package_name = process.argv[2]
if (package_name === undefined) {
  throw new Error('You need to provide package name as first argument')
}

console.log(`Gonna start a REPL with '${package_name}' installed and loaded for you`)

const packageLocation = (pkg) => {
  return path.resolve(TRYMODULE_PATH, 'node_modules', pkg)
}

const loadPackage = (pkg) => {
  return new Promise((resolve, reject) => {
    try {
      const loadedPackage = require(packageLocation(pkg))
      console.log(`'${pkg}' has already been installed! Jumping to REPL now`)
      resolve(loadedPackage)
    } catch (err) {
      console.log(`Couldn't find '${pkg}', downloading...`)
      npmi({name: pkg, path: TRYMODULE_PATH}, function (err, result) {
        if (err) {
          console.log(err.message)
          if (err.code === npmi.LOAD_ERR) {
            throw new Error('npm load error')
          }
          if (err.code === npmi.INSTALL_ERR) {
            throw new Error('npm install error')
          }
        }
        resolve(require(packageLocation(pkg)))
      })
    }
  })
}

const logGreen = (msg) => {
  console.log(colors.green(msg))
}

loadPackage(package_name).then((loadedPackage) => {
  const variable_friendly_package_name = package_name.replace('-', '_').replace('.', '_')

  logGreen(`Package '${package_name}' was loaded and assigned to '${variable_friendly_package_name}' in the current scope`)

  var replServer = repl.start({
    prompt: '> '
  })
  replServer.context[variable_friendly_package_name] = loadedPackage
})
