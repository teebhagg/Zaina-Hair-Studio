import { StructureBuilder } from 'sanity/structure'

export default (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Pages section - singleton documents (one document per page)
      S.listItem()
        .title('Pages')
        .child(
          S.list()
            .title('Pages')
            .items([
              S.listItem()
                .title('Homepage')
                .child(
                  S.document()
                    .schemaType('homepage')
                    .documentId('homepage')
                ),
              S.listItem()
                .title('About')
                .child(
                  S.document()
                    .schemaType('about')
                    .documentId('about')
                ),
            ])
        ),
      // Divider
      S.divider(),
      // Content sections - regular document lists (multiple documents)
      S.documentTypeListItem('service').title('Services'),
      S.documentTypeListItem('gallery').title('Gallery'),
      S.documentTypeListItem('promotion').title('Promotions'),
      S.documentTypeListItem('announcement').title('Announcements'),
      // S.documentTypeListItem('team').title('Team Members'),
      // Site Settings
      S.listItem()
        .title('Site Settings')
        .child(
          S.document()
            .title('Site Settings')
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
    ])

