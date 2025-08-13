const Util = require("./util");
const sharp = require("sharp");
const S3Lib = require("./metadata");
const fs = require("fs");
const path = require("path");
exports.Folders = S3Lib.Folders;
const convert = require("heic-convert");

exports.addPdfFile = async (
    parentDir,
    originalFileName,
    file,
    ) => {
        if (!originalFileName || !file) return "";
        // Check if it's actually a PDF
        if (!Util.isPdfFile(originalFileName)) {
            console.log("Not a PDF file.");
            return "";
        }
        
        let finalFileName = "";

        let tempFileName = await Util.generateRandomFileName(originalFileName);
        if (parentDir) {
            await createDirectories(parentDir);
            finalFileName = parentDir + "/" + tempFileName;
        } else {
            finalFileName = tempFileName;
        }
        
        try {
            await fs.writeFileSync(finalFileName, file);
            return finalFileName;
        } catch (e) {
            if (this.handlesError) {
                return { error: e };
            } else {
                console.log("File write error:", e);
                return "";
            }
    }
};

exports.removePdfFileById = async (parentDir, fileKey) => {
    let fileName = fileKey.split("/").pop();
    if (!fileName) return false;

    // Check if it's actually a PDF
    if (!Util.isPdfFile(fileName)) {
        console.log("Not a PDF file.");
        return false;
    }
    try {
        const filePath = path.join(parentDir, fileName);
            if (fs.existsSync(filePath)) {
            await fs.unlinkSync(filePath);
        }
        return true;
    } catch (e) {
        if (this.handlesError) {
            return { error: e };
        } else {
            console.log(e);
            return false;
        }
    }
};
        
async function createDirectories(pathName) {
    const __dirname = path.resolve();
    pathName = pathName.replace(/^\.*\/|\/?[^\/]+\.[a-z]+|\/$/g, "");
    await fs.mkdirSync(
        path.resolve(__dirname, pathName),
        { recursive: true },
        (e) => {
            if (e) {
                console.error("Directory creation error: ", e);
            }
        }
    );
}
 
 