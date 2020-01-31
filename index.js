const fs = require('fs')
const join = require('path').join
const AWS = require('aws-sdk')
const s3Zip = require('s3-zip')
const XmlStream = require('xml-stream')

const region = 'us-east-1'
const bucket = 'cambiatestbucket'
const folder = 'TestFolder/'
const s3 = new AWS.S3({ region: region })
const params = {
  Bucket: bucket,
  Prefix: folder
}

const filesArray = []
const files = s3.listObjects(params).createReadStream()
const xml = new XmlStream(files)
xml.collect('Key')
xml.on('endElement: Key', function(item) {
  filesArray.push(item['$text'].substr(folder.length))
})

xml
  .on('end', function () {
    zip(filesArray)
  })
  

function zip(files) {
  console.log(files)
  var upload = require('s3-write-stream')({
    accessKeyId: process.env.AWS_ACCESS_KEY
  , secretAccessKey: process.env.AWS_SECRET_KEY
  , Bucket: 'cambiatestzipped'
  })
  const output = fs.createWriteStream(join(__dirname, 'test.zip'))
  s3Zip
   .archive({ region: region, bucket: bucket, preserveFolderStructure: true }, folder, files)
   .pipe(output)


const fileName = 'test.zip'
const uploadFile = () => {
  fs.readFile(fileName, (err, data) => {
    if (err) throw err;
    const params = {
        Bucket: 'cambiatestzipped',
        Key: 'test.zip',
        Body: JSON.stringify(data, null, 2)
    };
    s3.upload(params, function(s3Err, data) {
        if (s3Err) throw s3Err
        console.log(`File uploaded successfully at ${data.Location}`)
    });
  });
};

uploadFile();
}



