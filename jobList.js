window.fsAttributes = window.fsAttributes || [];
window.fsAttributes.push([
  "cmsfilter",
  async (filtersInstances) => {
    // Get the filters instance
    const [filtersInstance] = filtersInstances;

    // Get the list instance
    const { listInstance } = filtersInstance;

    // Save a copy the template element
    const [item] = listInstance.items;
    const itemTemplateElement = item.element;

    // Fetch the external data
    const jobs = await fetchJobs();

    // Remove the placeholder items
    listInstance.clearItems();

    // Create the items from the external data
    const newItems = jobs.results.map((job) => createItem(job, 'jobData.description',
      itemTemplateElement));

    listInstance.addItems(newItems);

    // Get the radio template element
    const filtersContractTemplateElement = filtersInstance.form.querySelector(
      '[data-element="filter-contract"]');
    if (!filtersContractTemplateElement) return;
    const filtersLocationTemplateElement = filtersInstance.form.querySelector(
      '[data-element="filter-location"]');
    if (!filtersLocationTemplateElement) return;
    // Get the radio template element mobile
    const filtersContractTemplateElementModal = filtersInstance.form.querySelector(
      '[data-element="filter-contract-mobile"]');
    if (!filtersContractTemplateElementModal) return;
    const filtersLocationTemplateElementModal = filtersInstance.form.querySelector(
      '[data-element="filter-location-mobile"]');
    if (!filtersLocationTemplateElementModal) return;

    // Get the parent element of the radios
    const filtersWrapperElement = filtersContractTemplateElement.parentElement;
    if (!filtersWrapperElement) return;
    const filtersLocationWrapperElement = filtersLocationTemplateElement.parentElement;
    if (!filtersLocationWrapperElement) return;
    // Get the parent element of the radios mobile
    const filtersWrapperElementModal = filtersContractTemplateElementModal.parentElement;
    if (!filtersWrapperElementModal) return;
    const filtersLocationWrapperElementModal = filtersLocationTemplateElementModal
      .parentElement;
    if (!filtersLocationWrapperElementModal) return;

    // Remove the template radio element
    filtersContractTemplateElement.remove()
    filtersLocationTemplateElement.remove()
    filtersContractTemplateElementModal.remove()
    filtersLocationTemplateElementModal.remove()

    // Collect all the categories of the products
    const jobTypes = collectJobType(jobs.results)
    const cities = collectCity(jobs.results)

    for (const jobtype of jobTypes) {
      const newFilter = createFilter(jobtype, filtersContractTemplateElement);
      const newFilterMobile = createFilter(jobtype, filtersContractTemplateElementModal);
      if (!newFilter) continue;
      if (!newFilterMobile) continue;

      filtersWrapperElement.append(newFilter);
      filtersWrapperElementModal.append(newFilterMobile);
    }

    for (const city of cities) {
      const newFilterLocation = createFilter(city, filtersLocationTemplateElement);
      const newFilterLocationModal = createFilter(city,
        filtersLocationTemplateElementModal);
      if (!newFilterLocation) continue;
      if (!newFilterLocationModal) continue;

      filtersLocationWrapperElement.append(newFilterLocation);
      filtersLocationWrapperElementModal.append(newFilterLocationModal);
    }

    filtersInstance.storeFiltersData();

    listInstance.on('switchpage', (targetPage) => {});

    // Triger on add items
    listInstance.on('additems', (addedItems) => {
      let fadeUpCards = anime.timeline({
        loop: false,
        autoplay: false
      });
    });
  }
]);

let fetchJobs = async () => {
  try {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: 'Basic 813438d5227b9ea7eb3df82ec03b89a69d5585aa486a6cd52add3bb1081270ebcdd7850721798ac47139770f1d0a910af958cf7e543b2a29c6164c446343f446fca0633d8003239a150f86edd7ca693ba2477c72e725ab5202aafbdedcd4b226c31cdefb9aea7540afbae847a8f0aab6dc6248ff6fe507ebd52bec4fd1dc2c99'
      }
    };
    const response = await fetch(
      'https://app.loxo.co/api/wright-talent/jobs?published_at_sort=desc&status=active&per_page=100',
      options);
    const data = await response.json();
    return data;
  } catch (error) {
    return [];
  }
};

let fetchJob = (jobId, element) => {
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: 'Basic 813438d5227b9ea7eb3df82ec03b89a69d5585aa486a6cd52add3bb1081270ebcdd7850721798ac47139770f1d0a910af958cf7e543b2a29c6164c446343f446fca0633d8003239a150f86edd7ca693ba2477c72e725ab5202aafbdedcd4b226c31cdefb9aea7540afbae847a8f0aab6dc6248ff6fe507ebd52bec4fd1dc2c99'
    }
  };

  fetch('https://app.loxo.co/api/wright-talent/jobs/' + jobId, options)
    .then(response => response.json())
    .then(data => {
      if (element)
        element.innerHTML = data.description;
    })
    .catch(err => {
      return err
    })
};

var createItem = (job, jobDescription, templateElement) => {
  const newItem = templateElement.cloneNode(true);

  const urlLink = newItem.querySelector('[data-element="url-link"]');
  const title = newItem.querySelector('[data-element="title"]');
  const jobType = newItem.querySelector('[data-element="job-type"]');
  const jobCategory = newItem.querySelector('[data-element="job-category"]');
  const salary = newItem.querySelector('[data-element="salary"]');
  const location = newItem.querySelector('[data-element="location"]');
  const publishedAt = newItem.querySelector('[data-element="publishedAt"]');
  const description = newItem.querySelector('[data-element="job-description"]');

  const iconJob = Array.from(newItem.querySelectorAll('[data-element="job-icon"]'));

  if (urlLink)
    urlLink.href = 'https://mjrrecruitment.webflow.io/job?id=' + job.id;
  if (title)
    title.textContent = job.title;
  if (jobType)
    jobType.textContent = job.job_type.name
  if (jobCategory)
    jobCategory.textContent = job.category.name ? job.category.name : "Others"
  if (salary)
    salary.textContent = job.salary
  if (location)
    location.textContent = job.city
  if (publishedAt)
    publishedAt.textContent = moment(job.published_at).format("LL")
  if (description)
    fetchJob(job.id, description)
  if (iconJob) {
    iconJob.map((icon) => {
      const removeSkeleton = icon.querySelector(".skeleton-loader")

      if (removeSkeleton)
        removeSkeleton.remove()
    });
  }

  return newItem;
};

const collectJobType = (products) => {
  console.log("Testing Flow Job Type")
  const jobTypeCounts = {};

  for (const { job_type } of products) {
    const jobTypeName = job_type.name;

    if (!jobTypeCounts[jobTypeName]) {
      jobTypeCounts[jobTypeName] = 1;
    } else {
      jobTypeCounts[jobTypeName]++;
    }
  }

  const result = Object.keys(jobTypeCounts).map((name) => ({
    name,
    total: jobTypeCounts[name],
  }));

  return result;
};

const collectCity = (jobs) => {
  const cityCounts = {};

  for (const { category } of jobs) {
    const cityName = category.name ? category.name : "Others";

    if (!cityCounts[cityName]) {
      cityCounts[cityName] = 1;
    } else {
      cityCounts[cityName]++;
    }
  }

  const result = Object.keys(cityCounts).map((name) => ({
    name,
    total: cityCounts[name],
  }));

  return result;
}

const collectSalary = (jobs) => {
  const salaries = new Set();

  for (const { salary } of jobs) {
    salaries.add(salary.replaceAll("/year", "").replaceAll("/hour", ""));
  }
  return [...salaries]
}

const createFilter = (value, templateElement) => {
  const newFilter = templateElement.cloneNode(true);

  const label = newFilter.querySelector('span');
  const input = newFilter.querySelector('input');
  const count = newFilter.querySelector('p');
  if (!label || !input) return;

  label.textContent = value.name;
  input.value = value.name;
  input.id = 'radio-' + value.name;
  if (count) {
    count.textContent = value.total;
  }

  return newFilter;
}
