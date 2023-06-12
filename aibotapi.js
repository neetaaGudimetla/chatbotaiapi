import { loadQARefineChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { Configuration, OpenAIApi } from "openai";
import dotenv from 'dotenv';
import fetch from "node-fetch";
import mammoth from 'mammoth';
import * as puppeteer from 'puppeteer';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import multer from 'multer';
import * as path from 'path';
import { exec } from 'child_process';

/* TO RUN
node aibotapi.js */

const config = dotenv.config();
console.log('CHAT-BOT AI API KEY : ' + process.env.API_TOKEN);
const configuration = new Configuration({
    //organization: "org-sdfds34dsf",
    apiKey: process.env.API_TOKEN,
});
const openai = new OpenAIApi(configuration);
//------------
async function runQA(query) {
    // Create the models and chain   
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.API_TOKEN });
    const model = new OpenAI({ openAIApiKey: process.env.API_TOKEN });
    const chain = loadQARefineChain(model);

    // Load the documents and create the vector store
    const loader = new PDFLoader("./angular.pdf");
    const docs = await loader.loadAndSplit();
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Select the relevant documents
    const question = query;
    const relevantDocs = await store.similaritySearch(question);

    // Call the chain
    const res = await chain.call({
        input_documents: relevantDocs,
        question,
    });

    return res;
    /*
    {
      output_text: '\n' +
        '\n' +
        "answer"
    }
    */
}

async function runQAUrl(query, url) {
    console.log('MIDDLE WARE query:' + query);
    console.log('MIDDLE WARE url:' + url);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.API_TOKEN });
    const model = new OpenAI({ openAIApiKey: process.env.API_TOKEN });
    const chain = loadQARefineChain(model);

    // Load the documents and create the vector store

    const response = await fetch(url);
    const blob = await response.blob();

    const loader = new PDFLoader(blob);

    const docs = await loader.loadAndSplit();
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Select the relevant documents
    const question = query;
    const relevantDocs = await store.similaritySearch(question);

    // Call the chain
    const res = await chain.call({
        input_documents: relevantDocs,
        question,
    });

    return res;
}

async function runQAUrlBlob(query, blob) {
    console.log('MIDDLE WARE query:' + query);
    console.log('MIDDLE WARE url:' + blob);

    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.API_TOKEN });
    const model = new OpenAI({ openAIApiKey: process.env.API_TOKEN });
    const chain = loadQARefineChain(model);

    fs.readFile();

    const loader = new PDFLoader(blob);
    const docs = await loader.loadAndSplit();
    console.log('docs' + docs);
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings);
    console.log('store' + store);

    // Select the relevant documents
    const question = query;
    const relevantDocs = await store.similaritySearch(question);
    console.log('relevantDocs' + relevantDocs);
    // Call the chain
    const res = await chain.call({
        input_documents: relevantDocs,
        question,
    });
    console.log('res' + res);
    return res;
}
//----------------------------------------
//setup the server and routes
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const port = 3000;

app.get("/qa", async (req, res) => {
    try {
        const { query } = req.query;
        const answer = await runQA(query);
        res.status(200).send(answer);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

app.get("/qaurl", async (req, res) => {
    try {
        console.log(req);
        console.log(req.query.searchTxt);
        console.log(req.query.url);
        const answer = await runQAUrl(req.query.searchTxt, req.query.url);
        res.status(200).send(answer);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
//---------------------------
app.get("/qaurlblob", async (req, res) => {
    try {
        console.log(req);
        console.log(req.query.searchTxt);
        console.log(req.query.url);
        const answer = await runQAUrlBlob(req.query.searchTxt, req.query.url);
        res.status(200).send(answer);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
app.get("/qaurlblobtestpdf", async (req, res) => {
    try {
        console.log(req);
        console.log(req.query.searchTxt);
        console.log(req.query.url);
        const answer = await runQAUrlBlobTestPdf(req.query.searchTxt);
        res.status(200).send(answer);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
//----------------------------
app.get("/qaurlblobMultiplepdf", async (req, res) => {
    try {
        console.log(req);
        console.log(req.query.searchTxt);
        console.log(req.query.filename);
        const answer = await runQAUrlBlobMultiplePdf(req.query.searchTxt, req.query.filename);
        res.status(200).send(answer);

    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});
//----------------------------

app.post('/message', (req, res) => {
    // {prompt: "This is the message"}
    const response = openai.createCompletion({
        model: 'text-davinci-003',
        prompt: req.body.prompt,
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 256
    });

    response.then((data) => {
        console.log(data.data);
        console.log(data.data.choices[0].text);
        res.send({ message: data.data.choices[0].text });
    }).catch((err) => {
        res.send({ message: err });
    });

});
//---------------------------
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = path.resolve('./', 'uploads');
        console.log('storage --- folderPath ---> : ' + folderPath);
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        console.log('MULTER STORAGE file : ' + JSON.stringify(file));
        const originalname = file.originalname;
        const filename = originalname.replace(/\s+/g, '_');
        console.log('filename :: ' + filename);
        file.originalname = filename;
        cb(null, file.originalname);
        ////cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });
app.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        console.error('No file uploaded.');
        res.status(400).send('No file uploaded.');
        return;
    }
    // Process the uploaded file here, e.g., save it to a specific location
    res.send({ message: 'done' });
    //res.sendStatus(200);
});
//---------------------------

async function runQAUrlBlobTestPdf(query) {
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.API_TOKEN });
    const model = new OpenAI({ openAIApiKey: process.env.API_TOKEN });
    const chain = loadQARefineChain(model);
    const loader = new PDFLoader("./uploads/test.pdf");
    const docs = await loader.loadAndSplit();
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Select the relevant documents
    const question = query;
    const relevantDocs = await store.similaritySearch(question);

    // Call the chain
    const res = await chain.call({
        input_documents: relevantDocs,
        question,
    });

    return res;
}
//---------------------------
async function runQAUrlBlobMultiplePdf(query, filename) {
    console.log('runQAUrlBlobMultiplePdf query : ' + query);
    console.log('runQAUrlBlobMultiplePdf filename : ' + filename);
    const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.API_TOKEN });
    const model = new OpenAI({ openAIApiKey: process.env.API_TOKEN });
    const chain = loadQARefineChain(model);
    //const loader = new PDFLoader("./uploads/test.pdf");
    const loader = new PDFLoader("./uploads/" + filename);
    const docs = await loader.loadAndSplit();
    const store = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // Select the relevant documents
    const question = query;
    const relevantDocs = await store.similaritySearch(question);

    // Call the chain
    const res = await chain.call({
        input_documents: relevantDocs,
        question,
    });

    return res;
}
//------------------------------------------------------
async function convertWordToPDFNew(fileoriginalname) {

    console.log('convertWordToPDFNew 000000000000 : ' + fileoriginalname);
    var parts = fileoriginalname.split('.');
    console.log('convertWordToPDFNew 11111111111111 : ' + JSON.stringify(parts));
    console.log('convertWordToPDFNew 22222222222222 : ' + parts[0]);//filename

    let filenamewithoutext = parts[0] + '.pdf';
    console.log('convertWordToPDFNew 3333333333333 --- filenamewithoutext ---> : ' + filenamewithoutext);

    const filePath = path.resolve('./', 'uploads', filenamewithoutext);
    console.log('convertWordToPDFNew 3333333333333 --- filePath ---> : ' + filePath);

    const inputFilePath = path.resolve('./', 'uploads', fileoriginalname);
    console.log('convertWordToPDFNew 4444444444444 --- inputFilePath ---> : ' + inputFilePath);

    console.log('inputFilePath :: ' + inputFilePath);

    mammoth.convertToHtml({ path: inputFilePath })
        .then((result) => {
            const html = result.value;

            return convertHtmlToPdf(html, filePath);
        })
        .then((res) => {
            console.log('success converting to pdf');
        })
        .catch((error) => {
            console.error('Error converting file:', error);
            res.status(500).send('Error converting file to PDF');
        });
}
//------------------------------
async function convertTextToPDFNew(fileoriginalname, res) {

    console.log('convertTextToPDFNew 000000000000 : ' + fileoriginalname);

    var parts = fileoriginalname.split('.');
    console.log('convertTextToPDFNew 111111111111 : ' + JSON.stringify(parts));
    console.log('convertTextToPDFNew 222222222222 : ' + parts[0]);//filename   

    let filenamewithoutext = parts[0] + '.pdf';
    console.log('convertTextToPDFNew 3333333333333 --- filenamewithoutext ---> : ' + filenamewithoutext);

    const filePath = path.resolve('./', 'uploads', filenamewithoutext);
    console.log('convertTextToPDFNew 444444444444 --- filePath ---> : ' + filePath);

    const inputFilePath = path.resolve('./', 'uploads', fileoriginalname);
    console.log('convertTextToPDFNew --- inputFilePath ---> : ' + inputFilePath);

    console.log('TEXT--> inputFilePath :: ' + inputFilePath);

    //const inputFilePath = './input.txt';
    const outputFilePath = filePath;
    // Read the text file content
    fs.readFile(inputFilePath, 'utf8', async (err, text) => {
        if (err) {
            return res.status(500).send('Error reading the text file');
        }
        // Create a new PDF document
        const doc = new jsPDF();
        // Add the text content to the PDF document
        doc.text(text, 10, 10);
        // Save the PDF file
        doc.save(outputFilePath, (buffer) => {
            // Write the PDF buffer to a file
            fs.writeFile(outputFilePath, buffer, (err) => {
            });
        });

    });
}
//------------------------------
async function chromiumExecutablePath() {
    // Check if running on Render.com
    if (process.env.RENDER) {
        return '/usr/bin/google-chrome';
    }
    // Use Puppeteer's bundled Chromium
    return puppeteer.executablePath();
}
async function convertHtmlToPdf(html, filePath) {
    const browser = await puppeteer.launch({
        args: [
            "--disable-setuid-sandbox",
            "--no-sandbox",
            "--single-process",
            "--no-zygote",
        ],
        executablePath: process.env.NODE_ENV === "production"
            ? process.env.PUPPETEER_EXECUTABLE_PATH
            : puppeteer.executablePath(),
    });

    console.log(await browser.version());
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({ path: filePath });
    await browser.close();
}
//------------- DOC FILE RELATED --------------
const storageDoc = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        console.log('MULTER STORAGE DOC file : ' + JSON.stringify(file));
        ////cb(null, file.originalname);
        const originalname = file.originalname;
        const filename = originalname.replace(/\s+/g, '_');
        console.log('filename :: ' + filename);
        file.originalname = filename;
        cb(null, file.originalname);

    }
});
const uploadDoc = multer({ storage: storageDoc });
app.post('/convertDoc', uploadDoc.single('file'), (req, res) => {
    const file = req.file;
    const filenameDtTm = req.filenameDtTm;
    console.log(filenameDtTm);
    //--------------------------------
    var parts = file.originalname.split('.');
    console.log(JSON.stringify(parts));
    console.log('aaaaaaaaaaaaaaa ' + parts[0]);//filename
    console.log('bbbbbbbbbbbbbbb ' + parts[1]);//extension
    //--------------------------------
    if (parts[1] === 'doc' || parts[1] === 'docx') {
        convertWordToPDFNew(file.originalname);
    }
    if (parts[1] === 'txt') {
        convertTextToPDFNew(file.originalname, res);
    }

    if (!file) {
        console.error('No file uploaded.');
        res.status(400).send('No file uploaded.');
        return;
    }
    // Process the uploaded file here, e.g., save it to a specific location
    res.send({ message: 'done' });
    //res.sendStatus(200);
});
//+++++++++++++++++++++
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.post('/convert', (req, res) => {
    const file = req.files.file;
    console.log(JSON.stringify(file));

    const filePath = 'uploads/converted.pdf';

    mammoth.convertToHtml({ buffer: file.data })
        .then((result) => {
            const html = result.value;

            const pdfPath = filePath.replace('.pdf', '.html');

            fs.writeFile(pdfPath, html, (error) => {
                if (error) {
                    console.error('Error saving HTML:', error);
                    res.status(500).send('Error converting file to PDF');
                } else {
                    const conversionOpts = {
                        input: pdfPath,
                        output: filePath,
                        options: {
                            pageSize: 'A4'
                        }
                    };

                    mammoth.convertToPdf(conversionOpts)
                        .then(() => {
                            res.sendFile(filePath, () => {
                                fs.unlinkSync(pdfPath); // Delete the temporary HTML file
                                fs.unlinkSync(filePath); // Delete the temporary PDF file
                            });
                        })
                        .catch((error) => {
                            console.error('Error converting file:', error);
                            res.status(500).send('Error converting file to PDF');
                        });
                }
            });
        })
        .catch((error) => {
            console.error('Error converting file:', error);
            res.status(500).send('Error converting file to PDF');
        });
});
//------------- DOC FILE RELATED --------------
//------------------ DELETE A FILE -----------------------------
app.get('/deletefile', (req, res) => {
    console.log(req.query.filename);
    const filename = req.query.filename;
    console.log('deletefile >> ' + filename);
    const filePath = path.resolve('./', 'uploads', filename);
    console.log('deletefile --- filePath ---> : ' + filePath);
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('deletefile --> ' + err);
            res.status(500).send('An error occurred while deleting the file.');
        } else {
            console.log('File deleted successfully.' + filename);
            res.send({ 'message': 'File deleted successfully:' + filename });
        }
    });
});
//------------------ DELETE A FILE -----------------------------

app.listen(3000, () => console.log("Server started on " + port));

