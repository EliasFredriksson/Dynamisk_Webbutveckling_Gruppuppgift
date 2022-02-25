class CustomMorganToken {
    constructor(morgan, app) {
        this.morgan = morgan;
        this.app = app;
    }
    enable() {
        this.morgan.token("custom-print", (req, res) => {
            // Escape character for coloring text in terminal.
            let output = `\n\x1b[33m\x1b[1m============== REQUEST ==============\x1b[0m\n`;
            output += `URL:\t${req.baseUrl + req.url}\n`;
            output += `METHOD:\t\x1b[1m\x1b[36m${req.method}\x1b[0m\n`;
            let statusColor = "\x1b[35m"; // Default is Magenta (aka unknown).
            switch (parseInt(String(res.statusCode).charAt(0))) {
                case 2:
                    statusColor = "\x1b[32m";
                    break;
                case 3:
                    statusColor = "\x1b[33m";
                    break;
                case 4:
                case 5:
                    statusColor = "\x1b[31m";
                    break;
            }
            output += `STATUS:\t${statusColor}\x1b[1m${res.statusCode}\x1b[0m\n`;
            output += `CONTENT-TYPE:\t${req.headers["content-type"]}\n`;
            output += `PARAMS: ${this.__toString(req.params)}\n`;
            output += `BODY: ${this.__toString(req.body)}`;
            return output;
        });
        this.app.use(this.morgan(`:custom-print`)); // We use our own custom print.
    }
    __objectParser(object, currentOutput, counter = 4) {
        for (const key in object) {
            // Apply new row and current indentation.
            currentOutput += "\n";
            for (let c = 0; c < counter; c++) currentOutput += " ";
            // Is object
            if (
                typeof object[key] === "object" &&
                !Array.isArray(object[key]) &&
                !(object[key] === null || object[key] === undefined)
            ) {
                counter += 4;
                currentOutput += `${key}: {${this.__objectParser(
                    object[key],
                    "",
                    counter
                )}\n`;
                counter -= 4;
                for (let c = 0; c < counter; c++) currentOutput += " ";
                currentOutput += "}";
            }
            // Is array
            else if (Array.isArray(object[key])) {
                counter += 4;
                currentOutput += `${key}: [${this.__objectParser(
                    object[key],
                    "",
                    counter
                )}\n`;
                counter -= 4;
                for (let c = 0; c < counter; c++) currentOutput += " ";
                currentOutput += "]";
            }
            // Is string, boolean, number or null/undefined.
            else {
                let color = "\x1b[37m";
                if (
                    typeof object[key] === "boolean" ||
                    (isNaN(object[key]) &&
                        (object[key] === "true" || object[key] === "false"))
                )
                    color = "\x1b[33m";
                else if (
                    typeof object[key] === "number" ||
                    parseInt(object[key])
                )
                    color = "\x1b[32m";
                else if (object[key] === null || object[key] === undefined)
                    color = "\x1b[31m";

                currentOutput += `${key}: \x1b[1m${color}${object[key]}\x1b[0m,`;
            }
        }
        return currentOutput;
    }
    __toString(object) {
        if (object === undefined) return;
        let output = this.__objectParser(object, "{");
        if (output.length > 1) output += "\n";
        return output + "}";
    }
}

module.exports = CustomMorganToken;
