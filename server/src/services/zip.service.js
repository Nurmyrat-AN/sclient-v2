const AdmZip = require("adm-zip")

class ZipService {

    zip = async (datas) => {
        const zip = new AdmZip()
        Object.keys(datas).forEach(data_name => {
            zip.addFile(data_name, Buffer.from(JSON.stringify(datas[data_name]), "utf8"), "");
        })
        return zip.toBuffer()
    }

    unzip = async (file) => {
        const zip = new AdmZip(file);
        const zipEntries = zip.getEntries(); // an array of ZipEntry records
        const result = {}
        zipEntries.forEach(function (zipEntry) {
            result[zipEntry.name] = JSON.parse(zipEntry.getData().toString("utf8"))
        })
        return result

    }
}
const zipService = new ZipService()

module.exports = zipService