/*
 *  Copyright 2024 Curity AB
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

import {SerializeOptions, serialize} from 'cookie'
import {getEncryptedCookie} from './cookieEncrypter.js'
import OAuthAgentConfiguration from './oauthAgentConfiguration.js'
import {getATCookieName, getRTCookieName, getIDCookieName} from './cookieName.js'
import {getTempLoginDataCookieForUnset} from './pkce.js'
import {InvalidIDTokenException} from './exceptions/index.js'

const DAY_MILLISECONDS = 1000 * 60 * 60 * 24

function getCookiesForTokenResponse(tokenResponse: any, config: OAuthAgentConfiguration, unsetTempLoginDataCookie: boolean = false): string[] {

    const cookies = [
        getEncryptedCookie(config.cookieOptions, tokenResponse.access_token, getATCookieName(config.cookieNamePrefix), config.encKey)
    ]

    if (unsetTempLoginDataCookie) {
        cookies.push(getTempLoginDataCookieForUnset(config.cookieOptions, config.cookieNamePrefix))
    }

    if (tokenResponse.refresh_token) {
        const refreshTokenCookieOptions = {
            ...config.cookieOptions,
            path: config.endpointsPrefix + '/refresh'
        }
        cookies.push(getEncryptedCookie(refreshTokenCookieOptions, tokenResponse.refresh_token, getRTCookieName(config.cookieNamePrefix), config.encKey))
    }

    if (tokenResponse.id_token) {
        const idTokenCookieOptions = {
            ...config.cookieOptions,
            path: config.endpointsPrefix + '/claims'
        }

        const tokenParts = tokenResponse.id_token.split('.')
        if (tokenParts.length !== 3) {
            throw new InvalidIDTokenException()
        }

        cookies.push(getEncryptedCookie(idTokenCookieOptions, tokenParts[1], getIDCookieName(config.cookieNamePrefix), config.encKey))
    }

    return cookies
}

function getCookiesForUnset(options: SerializeOptions, cookieNamePrefix: string): string[] {

    const cookieOptions = {
        ...options,
        expires: new Date(Date.now() - DAY_MILLISECONDS),
    }

    return [
        serialize(getRTCookieName(cookieNamePrefix), "", cookieOptions),
        serialize(getATCookieName(cookieNamePrefix), "", cookieOptions),
        serialize(getIDCookieName(cookieNamePrefix), "", cookieOptions),
    ]
}

function getCookiesForAccessTokenExpiry(config: OAuthAgentConfiguration, accessToken: string): string[] {

    return [
        getEncryptedCookie(config.cookieOptions, accessToken, getATCookieName(config.cookieNamePrefix), config.encKey)
    ]
}

function getCookiesForRefreshTokenExpiry(config: OAuthAgentConfiguration, accessToken: string, refreshToken: string): string[] {

    const refreshCookieOptions = {
        ...config.cookieOptions,
        path: config.endpointsPrefix + '/refresh'
    }

    return [
        getEncryptedCookie(config.cookieOptions, accessToken, getATCookieName(config.cookieNamePrefix), config.encKey),
        getEncryptedCookie(refreshCookieOptions, refreshToken, getRTCookieName(config.cookieNamePrefix), config.encKey),
    ]
}

export { getCookiesForTokenResponse, getCookiesForUnset, getCookiesForAccessTokenExpiry, getCookiesForRefreshTokenExpiry };
