import fs from "node:fs";
import { parse } from "csv-parse";
import http from "node:http";

export async function parseCSV() {
  const csvPath = new URL("../data/tasks.csv", import.meta.url);
  const records = [];

  try {
    const parser = fs.createReadStream(csvPath).pipe(
      parse({
        trim: true,
        from_line: 2, // Ignora o cabeçalho
        delimiter: ";", // Use ';' se o seu CSV estiver separado por ponto e vírgula
        skip_empty_lines: true,
      })
    );

    for await (const record of parser) {
      const body = JSON.stringify({
        title: record[0],
        description: record[1],
      });

      try {
        const response = await sendPostRequest(
          "http://localhost:3333/tasks",
          body
        );

        if (response.statusCode !== 201) {
          console.error(
            `Failed to insert task: ${body}. Status: ${response.statusCode}`
          );
        } else {
          records.push(record);
          console.log(`Inserted task: ${body}`);
        }
      } catch (error) {
        console.error(`Error sending task to API: ${error.message}`);
      }
    }
  } catch (error) {
    console.error(`Error reading CSV file: ${error.message}`);
  }

  return records;
}

function sendPostRequest(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = http.request(options, (res) => {
      let data = "";

      // Recebe os dados da resposta
      res.on("data", (chunk) => {
        data += chunk;
      });

      // Quando a resposta estiver completa
      res.on("end", () => {
        resolve(res);
      });
    });

    // Tratamento de erro na requisição
    req.on("error", (error) => {
      reject(error);
    });

    // Envia o corpo da requisição
    req.write(body);
    req.end();
  });
}

// Função autoexecutável para testar
(async () => {
  const records = await parseCSV();
  console.info(`Total records processed: ${records.length}`);
})();
