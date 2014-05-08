var DNA = require("organic").DNA
var Organel = require("organic").Organel
var path = require("path")
var fork = require("child_process").fork
var _ = require("underscore")
var prefix = require("prefixobjpropertyvalues")

module.exports = Organel.extend(function(plasma, dna){
  dna = new DNA(dna)
  
  if(dna.cwd) {
    prefix(dna.cwd, dna.cwd_prefix || process.cwd(), path.join)
    dna.mergeBranchInRoot("cwd")
  }

  Organel.call(this, plasma, dna)

  if(!dna.reactOn && dna.dna)
    this.start(dna)
  else
    this.on(dna.reactOn, this.start)
  
  this.on(dna.killOn || "kill", this.kill)
},{
  start : function(options){
    var self = this
    var wrapperCell = options.wrapperCell || path.join(__dirname, "wrapper-cell.js")
    this.child = fork(wrapperCell, {
      cwd: process.cwd(),
      env: _.extend({}, process.env, options.env)
    })
    this.child.send({
      type: "init",
      dna: options.dna,
      name: options.name
    })
    this.child.on("error", function(err){
      if(options.log)
        console.error(options.name, err)
    })
    this.child.on("message", function(msg){
      if(msg.source == "plasma") {
        if(options.ignoreChemicals && options.ignoreChemicals.indexOf(msg.chemical.type) !== -1)
          return
        msg.chemical.source = options.name
        self.emit(msg.chemical)
      }
    })
    this.child.on("exit", function(code){
      if(options.log)
        console.warn(options.name, "exit", code)
      if(options.restartTimes > 0 && code != 143) {
        if(options.log)
          console.warn(options.name, "restarts left", options.restartTimes)
        options.restartTimes -= 1
        self.start(options)
      } else
        if(options.emitChildExit)
          self.emit({type: options.emitChildExit, dna: options})
    })
  },
  kill: function(){
    if(this.child) {
      this.child.send({type: "kill"})
      this.child.kill()
    }
    return false
  }
})