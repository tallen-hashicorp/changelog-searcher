const axios = require('axios');
const cliProgress = require('cli-progress');

const ChangelogURL = process.argv[2]
console.log(`processing: ${ChangelogURL}`)

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


async function main(){
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
                        console.log(`${version} - ${type} - ${changelogArr[lineNumber]}`)
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
