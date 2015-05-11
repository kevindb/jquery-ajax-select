<cfcomponent displayname="Task" output="false">
	<cffunction name="getStatusList" access="remote">
		<!--- local.response = this.newAPIResponse() --->
		<cfset local.response = {"success" = true, "errors" = [], "data" = {}}>

		<cfquery name="local.qryStatusList">
			SELECT	 statusId AS id
					,status AS name
			FROM	status
		</cfquery>

		<cfset local.response.data = this.queryToArray(local.qryStatusList)>

		<cfheader name="content-type" value="application/json">
		<cfif local.response.seccess neq true>
			<cfheader statuscode="424" statustext="Method Failure">
		</cfif>

		<cfreturn local.response>
	</cffunction>

	<cffunction name="queryToArray" access="public" hint="Returns reasonable array of objects from a cfquery">
		<cfargument name="query" type="query" required="true">
		<cfargument name="excludeColumns" type="string" required="false" default="">

		<cfscript>
			if (server.coldfusion.productName == "ColdFusion Server") {
				local.columns = arguments.query.getMetaData().getColumnLabels();
			} else if (server.coldfusion.productName == "Lucee") {
				local.columns = arguments.query.getColumnNames();
			} else {
				local.columns = [];
			}

			local.response = arrayNew(1);

			for (local.rowIndex=1; local.rowIndex<=arguments.query.recordCount; local.rowIndex++) {
				local.response[local.rowIndex] = structNew();

				for (local.columnIndex=1; local.columnIndex<=arrayLen(local.columns); local.columnIndex++) {
					local.columnName = local.columns[local.columnIndex];

					if(local.columnName != "" && (arguments.excludeColumns == "" || !listFindNoCase(arguments.excludeColumns, local.columnName))) {
						local.response[local.rowIndex][local.columnName] = arguments.query[local.columnName][local.rowIndex];
					}
				}
			}
		</cfscript>

		<cfreturn local.response>
	</cffunction>
</cfcomponent>
