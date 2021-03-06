const process = require('process');
const config = require('../package');
const path = require('path');
const fs = require('fs');
const co = require('co');
const confirm = require('co-prompt').confirm;

module.exports = (ep) => {

    function clearAllPublishedPath() {
        config.publish.publishedPaths = [];

        fs.writeFileSync(path.join(__dirname, '..', 'package.json'), JSON.stringify(config, null, 4), 'utf8');
        process.exit();
    }

    co(function * () {
        const isOk = yield confirm('Are you sure(y/n)?');
        if (!isOk) {
            process.exit()
        }

        const publishedPaths = config.publish.publishedPaths;

        //清理删除所有目标文件后清空配置文件中的目标路径
        ep.after('cleared', publishedPaths.length, () => {
            console.log('Clear all publish completed!');
            clearAllPublishedPath();
        })

        //执行RMIDIR命令清理删除所有配置文件中的目标路径
        for (let i = 0; i < publishedPaths.length; i++) {
            const thisPath = publishedPaths[i];
            const rmCmd = `RMDIR ${thisPath} /S /Q`;

            
            child_process.exec(rmCmd, (err, stdout, stderr) => {
                err && (console.log(err.message) || clearAllPublishedPath() || process.exit());
                console.log(`Clear publish ${thisPath}`);
                ep.emit('cleared');
            })
        }
    })
}