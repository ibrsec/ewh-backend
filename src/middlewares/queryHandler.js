"use strict";

module.exports =  (req, res, next) => {
  //?filter[field]=value&search[field]=value&skip=10&limit=10&page=2&sort[field]=desc

  //filter[field]=value&search[field]=value
  const filter = req.query?.filter || {};

  //search[field]=value&search[field]=value
  const search = req.query?.search || {};
  for (let key in search) search[key] = { $regex: search[key], $options: "i" };

  //sort[field]=desc(or asc)
  const sort = req.query?.sort || {};


  //limit=10&page=2&sort[field]=desc
  let limit = Number(req.query?.limit);
  limit = limit > 0 ? limit : Number(process.env.PAGE_SIZE || 10);

  //page=2&sort[field]=desc
  let page = Number(req.query?.page);
  page = page > 0 ? page : 1;

  //skip=10
  let skip = Number(req.query?.skip);
  skip = skip > 0 ? skip : (page - 1) * limit;


  //add a func to the response for be able to use query parameters like filter, search, page, limit 
  res.getModelList = async (Model, customFilters = {}, choosedSort = {}, populate = null) => {
    return await Model.find({ ...filter, ...search, ...customFilters })
      .sort({...sort, updatedAt: 'desc', ...choosedSort})
      .skip(skip)
      .limit(limit)
      .populate(populate);
  };

  //add a func to the response for be able to get used details of the query parameters
  res.getModelListDetails = async (Model, customFilters = {}, ) => {
    const data = await Model.find({ ...filter, ...search, ...customFilters });

    const totalRecords = data.length
    const totalPages = Math.ceil(totalRecords / limit);


    let details = {
      filter,
      customFilters,
      search,
      skip,
      limit,
      page,
      pages:{
        previous: page > 1 ?  page - 1 : false,
        current : page,
        next : page < totalPages ? page + 1 : false,
        totalPages,
      },
      totalRecords
    };

    // if(details?.page >= details?.pages?.totalPages) {details?.pages?.next = false;}
    // details.pages.next = details?.page >= details?.pages?.totalPages && false

    // if(details?.limit >= details?.totalRecords) {details?.pages = false;}
      if(limit >= totalRecords) details.pages = false;

    return details;

  };

  next();
};
