import React from 'react';
import { Button, Table, Pagination } from 'react-bootstrap';

/**
 * So, funny story.
 * I tried for a couple of hours to get the table package we used to display a page number stored
 * in state. Documentation suggests its possible, but no luck. So, here's my fix: replacing the table
 * altogether. Unfortunately i think this is necessary because the dumb thing resets every time you
 * update state, which seems like a massive oversight for, you know, any usability.
 * 
 * fortunately i had a basic table model that i built for another project, so im adapting that.
 */
 

 /**
  * Takes as props: 
  *     data: []
  *     headers: ['array', 'of', 'header', 'names']
  *     onSelect: function for this thing to call when you click the link for a row, which in 
  *               turn supplies the object of the row you clicked as props
  */
class LinkTable extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			page: 1,
			data:[],
			pages: {},
			headers: [],
		}

		this.buildPages = this.buildPages.bind(this);
		this.first = this.first.bind(this);
		this.last = this.last.bind(this);
		this.prev = this.prev.bind(this);
		this.next = this.next.bind(this);
	}

	componentDidMount() {
		const pages = this.buildPages();

		this.setState({
			pages: pages,
			headers: this.props.headers ? this.props.headers : []
		});
	}

	componentDidUpdate() {
		if (Object.values(this.props.data).length !== Object.values(this.state.data).length) {
			const pages = this.buildPages();

			this.setState({
				pages: pages,
				data: this.props.data,
				headers: this.props.headers ? this.props.headers : []
			});
		}
	}

	buildPages() {
		const pages = {};
		const pageSize = 10;
		let page = -1;
		const data = this.props.data ? this.props.data : []

		if (data.length > pageSize) {
			for (let i = 0; i < data.length; i++) {
				if (i % pageSize === 0) { 
					page++;
					pages[page] = []
				}
				pages[page].push(data[i]);
			}
		} else {
			pages[0] = data
		}

		return pages;
	}

	first() {
		this.setState({page: 1});
	}

	last() {
		this.setState({page: Object.keys(this.state.pages).length});
	}

	next() {
		if (Object.keys(this.state.pages).length > this.state.page) {
			this.setState({page: this.state.page + 1});
		}
	}

	prev() {
		if (this.state.page > 1) {
			this.setState({page: this.state.page - 1});
		}
	}

	select = (name) => () => {
		this.props.onSelect && this.props.onSelect(name);
	}

    render() {
		const { headers } = this.props;
		const { pages, page } = this.state;

		let header = [];
		let body = [];
		for (let i in headers) {
			let text = headers[i].charAt(0).toUpperCase() + headers[i].slice(1).toLowerCase();
			header.push(<th key={`header${i}`}>{text}</th>)
		}

		for (let i in pages[page - 1]) {
			let columns = [];
			for (let j in headers) {
				if (headers[j] in pages[page - 1][i]) {
					if (j == 1) { // This is a dumb fix lmao.
						columns.push(<td key={`row${j}${i}`}><Button variant="link" onClick={this.select(pages[page - 1][i])}>{pages[page - 1][i][headers[j]]}</Button></td>)
					} else {
						columns.push(<td key={`row${j}${i}`}>{pages[page - 1][i][headers[j]]}</td>)
					}
				}
			}
			body.push(<tr key={`row${i}`}>{columns}</tr>)
		}
		
        return (
            <div >
                <Table striped hover bordered>
					<thead>
						<tr>
							{header}
						</tr>
					</thead>
					<tbody>
						{body}
					</tbody>
				</Table>
				<Pagination>
					<Pagination.First onClick={this.first}/>
					<Pagination.Prev onClick={this.prev}/>
					<Pagination.Item>{page}</Pagination.Item>
					<Pagination.Next onClick={this.next}/>
					<Pagination.Last onClick={this.last}/>
				</Pagination>
            </div>
        )
    }
}

export default LinkTable;