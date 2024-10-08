const axios = require('axios');
const cliProgress = require('cli-progress');
const args = require('args')
const { Client } = require('@elastic/elasticsearch');
const c = require('args');

args
  .option('url', 'the URL of the changelog')
  .option('quit', "Do not print out changes")
  .option('elastic', 'the URL of an elastic search server')

const flags = args.parse(process.argv)

const ChangelogURL = flags.url
const elasticUrl = flags.elastic
console.log(`processing: ${ChangelogURL}`)

var client
if (elasticUrl){
    console.log(`Sending to elastic search: ${elasticUrl}`)
    const client = new Client({
        node: elasticUrl,
    })
}

function lineMatchesVersion(line){
    if (!line){
        return false
    }

    return line.match(/##\s(\d*\.\d*\.\d\.?\d?)/)
}

function lineMatchesType(line){
    if (!line){
        return false
    }

    return line.match(/^([A-Z ]+):/)
}

function isLineAChange(line){
    if (!line){
        return false
    }

    return line.match(/\*.*/)
}

function nextLineIfContinued(changelogArr,lineNumber){
    var foundNextChange = false
    var change = " "
    while(!foundNextChange){
        lineNumber++
        var currentLine = changelogArr[lineNumber]
        if (isLineAChange(currentLine) || lineMatchesType(currentLine) || lineMatchesVersion(currentLine) || lineNumber>changelogArr.length){
            foundNextChange = true
        }else{
            if (!currentLine){
                currentLine = " "
            }
            change = change + currentLine.trim()
        }
    }
    return change
}


async function main(){
    if (!ChangelogURL){
        console.log("Please provide a URL, for example node index.js --url https://raw.githubusercontent.com/hashicorp/vault/main/CHANGELOG.md")
        return
    }

    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    const changlogRSP = await axios.get(ChangelogURL)
    const changelog = changlogRSP.data
    const changelogArr = changelog.split("\n");
    
    bar1.start(changelogArr.length, 0);
    
    for (let lineNumber = 0; lineNumber < changelogArr.length; lineNumber++) {
        bar1.update(lineNumber+1);
        const matchVersion = lineMatchesVersion(changelogArr[lineNumber])
        
        if (matchVersion){
            const version = matchVersion[1]
            var foundNextVersion = false
        
            while (!foundNextVersion){
                lineNumber++
                bar1.update(lineNumber+1);
                
                //If the line finds the next version leave the loop
                if (lineMatchesVersion(changelogArr[lineNumber]) || lineNumber>changelogArr.length){
                    foundNextVersion=true
                    lineNumber--
                }

                const matchType = lineMatchesType(changelogArr[lineNumber])
                var foundNextType = false

                while(!foundNextType){
                    var type

                    if (lineMatchesType(changelogArr[lineNumber])){
                        type = lineMatchesType(changelogArr[lineNumber])[1]
                    }

                    if (isLineAChange(changelogArr[lineNumber])){
                        var change = changelogArr[lineNumber]
                        change = change + nextLineIfContinued(changelogArr,lineNumber)
                        if (!flags.quit){
                            console.log(`${version} - ${type} - ${change}`)
                        }
                    }


                    lineNumber++
                    bar1.update(lineNumber+1);

                    //If the line finds the next version leave the loop
                    if (lineMatchesVersion(changelogArr[lineNumber]) || lineNumber>changelogArr.length){
                        foundNextType=true
                        lineNumber--
                    }
                }
            }
        }
    }

    bar1.stop();
}
main()
