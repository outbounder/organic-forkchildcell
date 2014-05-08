var Plasma = require("organic-plasma")
var DNA = require("organic").DNA
var path = require("path")

var plasma = new Plasma()
var dna = new DNA()

var bootCell = function(name){
  var Nucleus = require("organic").Nucleus
  var nucleus = new Nucleus(plasma, dna)

  // given a name, always 'transfer' chemicals to master
  if(name) {
    plasma.pipe(function(c){
      // do not transfer to master in case of self kill
      if(c.type == "kill" && c.self) return
      try {
        process.send({
          source: "plasma",
          chemical: c
        })
      } catch(err){
        // because sending master failed, 
        // try to self kill
        plasma.emit({
          type: "kill",
          self: true
        })
      }
    })
  }

  if(dna.cell.membrane && dna.cell.plasma) {
    nucleus.build({branch: "cell.membrane"})
    nucleus.build({branch: "cell.plasma"})
  } else
    nucleus.build({branch: "cell"})
}

process.on("message", function(msg){
  if(msg.type == "init") {
    dna = new DNA({cell: msg.dna})
    bootCell(msg.name)
  }
  if(msg.type == "kill")
    plasma.emit("kill")
})
