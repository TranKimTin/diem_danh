"use strict";
import * as mysql from "../lib/mysql_connector";

export async function getOptionSectionClass(args) {
    let { user } = args;
    console.log(user.role_code, user.id_teacher)
    let optionSectionClass;
    if (user.role_code === 'ROLE_ADMIN') {
        optionSectionClass = await mysql.query(`SELECT section_class_name, id
                                                FROM section_class
                                                ORDER BY section_class_name`);
    }
    else {
        optionSectionClass = await mysql.query(`SELECT sc.section_class_name, sc.id
                                                FROM section_class sc
                                                JOIN teach t ON t.id_section_class = sc.id
                                                WHERE t.id_teacher = ?
                                                ORDER BY section_class_name`, [user.id_teacher]);
    }
    return { data: [], options: { optionSectionClass } };
}

export async function getAttendance(args) {
    let { pageSize, pageIndex, search, id_section_class } = args;
    let sql_select = `SELECT st.student_code, st.student_name, st.id AS id_student, JSON_ARRAYAGG(JSON_OBJECT("start_time", sd.start_time, "end_time", sd.end_time, "timestamp", atd.timestamp, "id_schedule", sd.id, "teacher_name", teacher.teacher_name)) AS attendance
                        FROM student st 
                        JOIN study ON st.id = study.id_student
                        JOIN section_class sc ON sc.id = study.id_section_class
                        JOIN schedule sd ON sd.id_section_class =  sc.id
                        LEFT JOIN attendance atd ON atd.id_schedule = sd.id AND atd.id_student = st.id
                        LEFT JOIN teacher ON teacher.id = atd.id_teacher
                        WHERE sc.id = ? AND (st.student_name LIKE ? OR st.student_code LIKE ? )
                        GROUP BY st.student_code, st.student_name, st.id
                        ORDER BY st.student_name
                        LIMIT ? OFFSET ?
                        `;
    let sql_count = `SELECT count(1) AS count
                        FROM student st 
                        JOIN study ON st.id = study.id_student
                        JOIN section_class sc ON sc.id = study.id_section_class
                        WHERE sc.id = ? AND (st.student_name LIKE ? OR st.student_code LIKE ? )`;
    let [data, [{ count }]] = await Promise.all([
        mysql.query(sql_select, [id_section_class, search, search, pageSize, (pageIndex - 1) * pageSize]),
        mysql.query(sql_count, [id_section_class, search, search])
    ]);

    for (let item of data) {
        item.attendance = JSON.parse(item.attendance);
        item.attendance.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        for (let i of item.attendance) {
            if (!i.timestamp) {
                i.status = 'x';
                i.color = 'red';
            }
            else {
                i.status = 'check';
                let timestamp = new Date(i.timestamp).getTime() / 1000;
                let startTime = new Date(i.start_time).getTime() / 1000;
                let endTime = new Date(i.end_time).getTime() / 1000;
                if (timestamp >= endTime) i.color = 'teal';
                else if (timestamp < startTime + 30 * 60) i.color = 'green';
                else if (timestamp < startTime + 60 * 60) i.color = 'orange';
                else if (timestamp < endTime) i.color = 'brown';
            }
        }
    }
    return {
        data,
        count
    };
}

export async function attendance(args) {
    let { id_student, id_schedule, id_teacher } = args;
    let [{ count }] = await mysql.query(`SELECT count(1) AS count FROM attendance WHERE id_student = ? AND id_schedule = ? LIMIT 1`, [id_student, id_schedule]);
    if (count === 0) {
        let [{ start_time }] = await mysql.query(`SELECT start_time FROM schedule WHERE id = ? LIMIT 1`, [id_schedule]);
        if (new Date(start_time).getTime() / 1000 - 15 * 60 > new Date().getTime() / 1000) {
            throw { message: 'Chưa đến thời gian học', code: 405 };
        }
        await mysql.query(`INSERT INTO attendance(id_student, id_schedule, id_teacher) VALUES (?, ?, ?)`, [id_student, id_schedule, id_teacher]);
    }
    return [];
}