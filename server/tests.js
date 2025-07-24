import pkg from 'jsonwebtoken';
const { sign ,verify,decode} = pkg;
import 'dotenv'
const jwtSecret = process.env.JWT_SECRET || "beoep"

const data = {
    id:"uytresxcvbn"
}
const encrypted = sign(data,jwtSecret)
const trueValidation = verify(encrypted,jwtSecret)
/* const falseValidation = verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InV5dHJlc3hjdmJuIiwiaWF0IjoxNzUzMjcwNDEwfQ.nl5xilcV9jREPWmYB7u49uLVKtI8nPJpV2iTtGkqTk5",jwtSecret) */
const decoded = decode(encrypted,jwtSecret)

console.log("Encrypted: ",encrypted)
console.log("True validation: ",trueValidation)
//console.log("False validation: ",falseValidation)
console.log("Decoded: ",decoded)  