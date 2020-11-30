import React, { Component } from "react";
import {
    Segment,
    Header,
    Table,
    Grid,
    Icon,
    Pagination,
    Checkbox
} from "semantic-ui-react";
import CustomSearch from "../common/search";
import ImportCSV from "../common/modal_import_csv";
import ModalInsert from "../common/modal_insert";
import ModalDelete from "../common/modal_delete";
import PageSize from "../common/page_size";
import TableHeader from "../common/table_header";
import CategoryAction from "../../../state/ducks/category/actions";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import moment from 'moment';
import LoaderActive from "../common/loader";

class Semester extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: "",
            codeDelete: '',
            arrayCodeDelete: [],
            titleModal: "",
            type: "new",
            search: ''
        };
        this.handleSave = this.handleSave.bind(this);
        this.openModalDelete = this.openModalDelete.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleClickNew = this.handleClickNew.bind(this);
        this.actionImport = this.actionImport.bind(this);
        this.onPageChange = this.onPageChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.onPageSizeChange = this.onPageSizeChange.bind(this);
        this.select = this.select.bind(this);
        this.isSelectAll = this.isSelectAll.bind(this);
        this.selectAll = this.selectAll.bind(this);
    }

    componentDidMount() {
        let { dispatch } = this.props;
        dispatch(CategoryAction.getSemester());
    }

    handleClickNew(item) {
        if (!item) {
            this.setState({
                titleModal: "Thêm mới học kỳ",
                type: "new",
                id: "",
            });
        } else {
            this.setState({
                id: item.id,
                titleModal: "Sửa học kỳ",
                type: "edit",
            });
            if (item.date_of_birth) item.date_of_birth = moment(item.date_of_birth).format('YYYY-MM-DD');
        }
        let { dispatch } = this.props;
        dispatch(CategoryAction.openModal(item));
    }

    openModalDelete(semesterCode) {
        let { dispatch } = this.props;
        dispatch(CategoryAction.openModalDelete());
        this.setState({ codeDelete: semesterCode });
    }

    handleSave(data) {
        let { dispatch } = this.props;
        let { type, id } = this.state;
        if (type === 'new') {
            dispatch(CategoryAction.insertSemester([data]));
        }
        if (type === 'edit') {
            data.push(id);
            dispatch(CategoryAction.updateSemester(data));
        }
    }

    handleDelete(data) {
        let { dispatch } = this.props;

        if (data.length === 0) return toastr.error("Chưa chọn học kỳ nào");
        dispatch(CategoryAction.deleteSemester({ data }));
        this.setState({
            codeDelete: '',
            arrayCodeDelete: []
        });
    }

    actionImport(data) {
        let { dispatch } = this.props;
        dispatch(CategoryAction.insertSemester(data));
    }

    onPageChange(e, { activePage }) {
        let { dispatch, paging } = this.props;
        let { search } = this.state;
        let newPaging = paging;
        newPaging.pageIndex = activePage * 1;
        dispatch(CategoryAction.getSemester({ ...newPaging, search }));
    }

    handleSearch(search) {
        let { dispatch, paging } = this.props;
        this.setState({ search });
        dispatch(CategoryAction.getSemester({ ...paging, search }))
    }

    onPageSizeChange(pageSize) {
        let { dispatch, paging } = this.props;
        let { search } = this.state;
        dispatch(CategoryAction.getSemester({ ...paging, pageSize, search }));
    }

    select(checked, code) {
        let { arrayCodeDelete = [] } = this.state;
        arrayCodeDelete = arrayCodeDelete.filter(item => item !== code);
        if (checked) {
            arrayCodeDelete.push(code);
        }
        this.setState({ arrayCodeDelete });
    }

    isSelectAll() {
        let { list } = this.props;
        let { arrayCodeDelete } = this.state;
        for (let item of list)
            if (!arrayCodeDelete.includes(item.semester_code))
                return false;
        return true;
    }

    selectAll(e, data) {
        let { list } = this.props;
        let { arrayCodeDelete } = this.state;
        list = list.map(item => item.semester_code);
        arrayCodeDelete = arrayCodeDelete.filter(item => !list.includes(item));
        if (data.checked) arrayCodeDelete.push(...list);
        this.setState({ arrayCodeDelete });
    }

    render() {
        let { list = [], loading = false, paging = {
            pageSize: 25,
            pageIndex: 1,
            totalPage: 1,
        } } = this.props;
        let { titleModal, arrayCodeDelete = [], codeDelete = '' } = this.state;
        let data = (codeDelete !== '') ? [codeDelete] : arrayCodeDelete;
        let fields = [
            { name: "Mã học kỳ", code: "semester_code" },
            { name: "Tên học kỳ", code: "semester_name" }
        ];
        let header = [
            { name: 'Mã học kỳ', code: 'semester_code', width: 6 },
            { name: 'Tên học kỳ', code: 'semester_name', width: 7 }
        ];
        return (
            <Segment>
                <Header> Danh sách học kỳ </Header>
                <Grid>
                    <Grid.Row>
                        <Grid.Column>
                            <ModalInsert
                                handleSave={this.handleSave}
                                fields={fields}
                                titleModal={titleModal}
                                handleNew={this.handleClickNew} />
                        </Grid.Column>
                        <Grid.Column>
                            <ImportCSV
                                fields={fields.map(item => item.name)}
                                actionImport={this.actionImport}
                            />
                        </Grid.Column>
                        <Grid.Column width={2}>
                            <ModalDelete
                                handleDelete={this.handleDelete}
                                data={data}
                                onClose={() => { this.setState({ codeDelete: '' }) }}
                            />
                        </Grid.Column>
                        <Grid.Column width={9}> </Grid.Column>
                        <Grid.Column width={3}>
                            <CustomSearch
                                handleSearch={this.handleSearch} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                <Table celled sortable selectable>
                    <TableHeader
                        isSelectAll={this.isSelectAll}
                        selectAll={this.selectAll}
                        header={header}
                    />
                    {loading ?
                        <Table.Cell colSpan={16}><LoaderActive /></Table.Cell> :
                        <Table.Body>
                            {list.map((item, stt) => (
                                <Table.Row key={stt}>
                                    <Table.Cell> {(paging.pageIndex - 1) * paging.pageSize + stt + 1} </Table.Cell>
                                    <Table.Cell>
                                        <Checkbox className='margin-right-5' checked={arrayCodeDelete.includes(item.semester_code)} onChange={(e, data) => { this.select(data.checked, item.semester_code) }} />
                                        <Icon
                                            className="margin-5 icon-button "
                                            name="pencil"
                                            color="blue"
                                            onClick={() => {
                                                this.handleClickNew(item);
                                            }}
                                        />
                                        <Icon
                                            className="margin-5 icon-button "
                                            name="trash alternate"
                                            color="red"
                                            onClick={() => {
                                                this.openModalDelete(
                                                    item.semester_code
                                                );
                                            }}
                                        />
                                    </Table.Cell>
                                    <Table.Cell> {item.semester_code} </Table.Cell>
                                    <Table.Cell> {item.semester_name} </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    }
                </Table>
                <PageSize onPageSizeChange={this.onPageSizeChange} value={paging.pageSize} />
                <Pagination
                    activePage={paging.pageIndex}
                    ellipsisItem={{ content: <Icon name='ellipsis horizontal' />, icon: true }}
                    firstItem={{ content: <Icon name='angle double left' />, icon: true }}
                    lastItem={{ content: <Icon name='angle double right' />, icon: true }}
                    prevItem={{ content: <Icon name='angle left' />, icon: true }}
                    nextItem={{ content: <Icon name='angle right' />, icon: true }}
                    totalPages={paging.totalPage}
                    onPageChange={this.onPageChange}
                    floated='right'
                />
            </Segment>
        );
    }
}

const mapStateToProps = (state) => ({
    list: state.category.list,
    paging: state.category.paging,
    loading: state.category.loading
});
export default connect(mapStateToProps)(Semester);
