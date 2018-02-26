import KloudlessSDK from '../../lib/kloudless'

let kloudless = new KloudlessSDK(process.env.API_KEY || 'your-api-key-here')

if (process.env.DEV_KEY)
    kloudless.setDeveloperKey(process.env.DEV_KEY)
if (process.env.API_HOST)
    kloudless.setHost(process.env.API_HOST, process.env.API_PORT || 443)
if (process.env.API_CA != null)
    kloudless.setCA(process.env.API_CA)

let applicationId;



test('List applications', done => {
    kloudless.applications.list({}, function (err, res, response) {
        expect(err).toBe(null)

        expect(res.api).toBe('meta')
        expect(res.type).toBe('object_list')
        done()
    })

})

test('Create an application', done => {
    kloudless.applications.create({
        name: 'Test Create'
    }, function (err, res, response) {
        expect(err).toBe(null)

        expect(res.name).toBe('Test Create')
        expect(res.id).not.toBeNull()
        applicationId = res.id
        done()
    })
})

test('Get an application', done => {
    kloudless.applications.get({
        application_id: applicationId
    }, function (err, res, response) {
        expect(err).toBe(null)

        expect(res.api).toBe('meta')
        expect(res.type).toBe('application')
        done()
    })
})

test('Update an application', done => {
    kloudless.applications.update({
        application_id: applicationId,
        name: 'Test Update',
    }, function (err, res, response) {
        expect(err).toBe(null)

        expect(res.name).toBe('Test Update')
        done()
    })
})


test('Delete an application', done => {
    kloudless.applications.delete({
        application_id: applicationId
    }, function (err, res, response) {
        expect(err).toBe(null)

        expect(response.statusCode).toBe(200)
        done()
    })
})

