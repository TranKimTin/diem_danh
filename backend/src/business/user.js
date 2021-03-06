"use strict";
import * as mysql from "../lib/mysql_connector";
import md5 from 'md5';
import jwt from 'jsonwebtoken';

export async function getToken(args) {
    let { username, password } = args;
    let user = await mysql.query(`SELECT username, t.id AS id_teacher, teacher_name, teacher_code, role_name, role_code, s.id AS id_student
                                    FROM user u 
                                    LEFT JOIN teacher t ON u.username = t.teacher_code
                                    LEFT JOIN student s ON u.username = s.student_code
                                    JOIN role r ON r.id = u.role 
                                    WHERE username = ? AND password = ? 
                                    limit 1`, [username, md5(username + password)]);
    if (user.length === 0) {
        throw { message: 'Tên đăng nhập hoặc mật khẩu không đúng', code: 402 };
    }
    try {
        let access_token = await mysql.query(`SELECT token FROM access_token WHERE username = ? limit 1`, [username]);
        if (access_token.length === 0) throw {};
        access_token = access_token[0].token;
        jwt.verify(access_token, config.jwt.secret_key);
        return { access_token };
    }
    catch (err) {
        await mysql.query(`DELETE FROM access_token WHERE username = ?`, [username]);
        user = user[0];
        let u = {
            username: user.username,
            name: user.teacher_name,
            code: user.teacher_code,
            role_name: user.role_name,
            role_code: user.role_code,
            id_teacher: user.id_teacher,
            id_student: user.id_student
        };
        let access_token = jwt.sign(u, config.jwt.secret_key, config.jwt.options);
        await mysql.query(`INSERT INTO access_token(username,token) VALUES (?,?)`, [username, access_token]);
        return { access_token };
    }
}

export async function requireToken(args) {
    let { access_token } = args;
    try {
        let [{ count }] = await mysql.query(`SELECT count(1) AS count FROM access_token WHERE token = ? limit 1`, [access_token]);
        if (count * 1 > 0) {
            let user = jwt.verify(access_token, config.jwt.secret_key);
            return user;
        }
    }
    catch (err) {
        await mysql.query(`DELETE FROM access_token WHERE token = ?`, [access_token]);
        throw { code: 401, message: 'Phiên đăng nhập hết hạn, vui lòng đăng nhập lại' }
    }
    throw { code: 401, message: 'Token không hợp lệ' };
}

export async function logout(args) {
    let { access_token } = args;
    await mysql.query(`DELETE FROM access_token WHERE token = ?`, [access_token]);
    throw { code: 401, message: 'Đăng xuất thành công' }
}

//////////////////////USER//////////////////////////////////

export async function getUser(args) {
    let { pageSize, pageIndex, search } = args;
    let sql_select = `SELECT u.id, u.username, r.role_name, role_code, t.teacher_name
                        FROM user u 
                        JOIN role r ON r.id = u.role
                        LEFT JOIN teacher t ON t.teacher_code = u.username
                        WHERE username LIKE ? OR teacher_name LIKE ? 
                        ORDER BY username
                        LIMIT ? OFFSET ?`;
    let sql_count = `SELECT count(1) AS count 
                        FROM user u 
                        JOIN role r ON r.id = u.role
                        LEFT JOIN teacher t ON t.teacher_code = u.username
                        WHERE username LIKE ? OR teacher_name LIKE ? `;
    let sql_select_role = `SELECT role_name, role_code 
                            FROM role 
                            ORDER BY role_name`;
    let [data, [{ count }], optionRole] = await Promise.all([
        mysql.query(sql_select, [search, search, pageSize, (pageIndex - 1) * pageSize]),
        mysql.query(sql_count, [search, search]),
        mysql.query(sql_select_role)
    ]);
    return {
        data,
        count,
        options: { optionRole }
    };
}

export async function insertUser(args) {
    let role_id = await mysql.query(`SELECT id, role_code FROM role`);
    role_id = role_id.reduce((a, b) => {
        a[b.role_code] = b.id;
        return a;
    }, {})
    for (let item of args) {
        item[1] = md5(item[0] + item[1]);
        item[2] = role_id[item[2]];  //item[2]: role_code
    }
    return await mysql.query(`INSERT INTO user(username, password, role) VALUES ?`, [args]);
}

export async function updateUser(args) {
    let [{ id }] = await mysql.query(`SELECT id FROM role where role_code = ? LIMIT 1`, [args[2]]);
    args[1] = md5(args[0] + args[1]);
    args[2] = id;
    return await mysql.query(`UPDATE user SET 
                                username = ?, password = ?, role = ?
                                WHERE id = ?`, args);
}

export async function deleteUser(args) {
    await mysql.query(`DELETE FROM user WHERE username IN (?)`, [args]);
    return await mysql.query(`DELETE FROM access_token WHERE username IN (?)`, [args]);
}