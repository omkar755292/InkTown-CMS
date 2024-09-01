import React, { Fragment, useState } from "react";
import PageHeader from "../../../layout/layoutsection/pageHeader/pageHeader";
import OrderListTable from "./OrderListTable";

const OrderList = () =>
{
	return (
		<div>
			<PageHeader currentpage="Order History Table" activepage="Dashboard" mainpage="Order History" />
			<div className="grid grid-cols-12 gap-6">
				<div className="col-span-12">
					<div className="box xl:overflow-auto">
						<div className="box-header">
							<h5 className="box-title">Order History</h5>
						</div>
						<div className="box-body">
							<div className="overflow-auto table-bordered">
								<OrderListTable />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderList;