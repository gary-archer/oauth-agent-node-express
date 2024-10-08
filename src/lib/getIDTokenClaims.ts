/*
 *  Copyright 2022 Curity AB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import {decryptCookie} from './cookieEncrypter.js'
import {InvalidCookieException, InvalidIDTokenException} from './exceptions/index.js'

function getIDTokenClaims(encKey: string, encryptedCookie: string): Object {

    let idToken = null
    try {
        idToken = decryptCookie(encKey, encryptedCookie)
    } catch (err: any) {
        const error = new InvalidCookieException(err)
        error.logInfo = 'Unable to decrypt the ID cookie to get claims'
        throw error
    }

    try {
        const claims = JSON.parse(String(Buffer.from(idToken, 'base64').toString('binary')))
        return claims
    } catch (err: any) {
        throw new InvalidIDTokenException(err)
    }
}

export default getIDTokenClaims
