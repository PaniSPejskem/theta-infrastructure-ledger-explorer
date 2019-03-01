import React, { Component } from "react";
import { browserHistory } from 'react-router';

import { blocksService } from 'common/services/block';
import BlocksTable from "common/components/blocks-table";
import Pagination from "common/components/pagination";

const MAX_BLOCKS = 50;

export default class Blocks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backendAddress: this.props.route.backendAddress,
      blockHeight: 0,
      blockInfoList: [],
      currentPageNumber: 0,
      totalPageNumber: 0
    };
    this.receivedBlocksEvent = this.receivedBlocksEvent.bind(this);
    this.handleGetBlocksByPage = this.handleGetBlocksByPage.bind(this);
  }

  componentDidMount() {
    const { currentPageNumber } = this.state;
    blocksService.getBlocksByPage(currentPageNumber, MAX_BLOCKS)
      .then(res => {
        this.receivedBlocksEvent(res);
      }).catch(err => {
        console.log(err);
      })
  }

  receivedBlocksEvent(data) {
    if (data.data.type == 'block_list') {
      this.setState({
        blockInfoList: data.data.body,
        currentPageNumber: data.data.currentPageNumber,
        totalPageNumber: data.data.totalPageNumber
      })
    }
  }
  handleGetBlocksByPage(pageNumber) {
    blocksService.getBlocksByPage(pageNumber, MAX_BLOCKS)
      .then(res => {
        this.receivedBlocksEvent(res);
      }).catch(err => {
        console.log(err);
      })
  }
  render() {
    const { blockInfoList } = this.state;
    let { currentPageNumber, totalPageNumber } = this.state;
    currentPageNumber = Number(currentPageNumber);
    totalPageNumber = Number(totalPageNumber);
    return (
      <div className="content blocks">
        <div className="page-title blocks">Blocks</div>
        <BlocksTable 
          blocks={blockInfoList}
          truncate={ 70 } />
        <Pagination
          size={'lg'}
          totalPages={totalPageNumber}
          currentPage={currentPageNumber}
          callback={this.handleGetBlocksByPage}
           />
      </div>
    );
  }
}