import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { Icon, Menu } from "semantic-ui-react";
import { connect } from "react-redux";
import MenuAction from "../../../state/ducks/menu/actions";

class Category extends Component {

    handleItemSideBarClick = (e, { name }) => {
        this.props.dispatch(MenuAction.handleItemSideBarClick(name));
    };

    render() {
        const { active_item } = this.props;
        return (
            <div>
                <Menu vertical inverted>
                    <Menu.Item
                        as={Link}
                        name='student'
                        active={active_item === 'student'}
                        onClick={this.handleItemSideBarClick}
                        to={'/category/student'}>
                        <Icon name={'student'} />
                        Sinh viên
                    </Menu.Item>
                </Menu>
                <Menu vertical inverted>
                    <Menu.Item
                        as={Link}
                        name='class'
                        active={active_item === 'class'}
                        onClick={this.handleItemSideBarClick}
                        to={'/category/class'}>
                        <Icon name={'users'} />
                        Lớp
                    </Menu.Item>
                </Menu>
                <Menu vertical inverted>
                    <Menu.Item
                        as={Link}
                        name='teacher'
                        active={active_item === 'teacher'}
                        onClick={this.handleItemSideBarClick}
                        to={'/category/teacher'}>
                        <Icon name={'street view'} />
                        Giảng viên
                    </Menu.Item>
                </Menu>
                <Menu vertical inverted>
                    <Menu.Item
                        as={Link}
                        name='subject'
                        active={active_item === 'subject'}
                        onClick={this.handleItemSideBarClick}
                        to={'/category/subject'}>
                        <Icon name={'book'} />
                        Môn học
                    </Menu.Item>
                </Menu>
                <Menu vertical inverted>
                    <Menu.Item
                        as={Link}
                        name='year'
                        active={active_item === 'year'}
                        onClick={this.handleItemSideBarClick}
                        to={'/category/year'}>
                        <Icon name={'calendar outline'} />
                        Năm học
                    </Menu.Item>
                </Menu>
                <Menu vertical inverted>
                    <Menu.Item
                        as={Link}
                        name='semester'
                        active={active_item === 'semester'}
                        onClick={this.handleItemSideBarClick}
                        to={'/category/semester'}>
                        <Icon name={'calendar alternate outline'} />
                        Học kỳ
                    </Menu.Item>
                </Menu>
            </div>

        );
    }
}

const mapStateToProps = state => {
    return {
        active_item: state.menu.active_item
    }
};

export default connect(mapStateToProps)(Category);