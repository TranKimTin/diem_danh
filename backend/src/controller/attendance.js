'use strict';
import * as Attendance from '../business/attendance';

export async function getOptionSectionClass(req, res, next) {
    try {
        let { user } = req;
        if (!(user.role_code === 'ROLE_ADMIN' || user.role_code === 'ROLE_TEACHER')) {
            throw { message: 'Không có quyền truy cập', code: 403 }
        }
        let response = await Attendance.getOptionSectionClass({ user });
        res.sendJson({
            data: response.data,
            options: response.options
        });
    } catch (error) {
        console.error(error.message);
        res.sendError({ code: error.code, message: error.message || undefined });
    }
}

export async function getAttendance(req, res, next) {
    try {
        let id_section_class = req.params.id_section_class * 1;
        let pageSize = req.query.pageSize * 1 || 25;
        let pageIndex = req.query.pageIndex * 1 || 1;
        let search = req.query.search || '';
        let paging = {
            pageSize: pageSize,
            pageIndex: pageIndex,
            totalPage: 0
        };
        search = `%${search}%`;
        let response = await Attendance.getAttendance({ pageSize, pageIndex, search, id_section_class });
        paging.totalPage = Math.ceil(response.count / paging.pageSize);
        res.sendJson({
            data: response.data,
            paging
        });
    } catch (error) {
        console.error(error.message);
        res.sendError({ code: error.code, message: error.message || undefined });
    }
}

export async function attendance(req, res, next) {
    try {
        let { user } = req;
        let id_student = req.params.id_student * 1;
        let id_schedule = req.params.id_schedule * 1;
        let id_teacher = user.id_teacher || null;
        let response = await Attendance.attendance({ id_student, id_schedule, id_teacher });
        res.sendJson({
            data: response.data,
            options: response.options
        });
    } catch (error) {
        console.error(error.message);
        res.sendError({ code: error.code, message: error.message || undefined });
    }
}