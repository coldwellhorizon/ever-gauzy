import { Connection } from 'typeorm';
import { Invoice } from './invoice.entity';
import * as faker from 'faker';
import {
	DiscountTaxTypeEnum,
	InvoiceStatusTypesEnum,
	InvoiceTypeEnum,
	IOrganization,
	ITenant
} from '@gauzy/contracts';
import * as _ from 'underscore';
import { OrganizationContact, Tag } from './../core/entities/internal';

export const createDefaultInvoice = async (
	connection: Connection,
	tenant: ITenant,
	defaultOrganizations: IOrganization[],
	noOfInvoicePerOrganization: number
) => {
	for (const organization of defaultOrganizations) {
		const invoices: Invoice[] = [];
		const tags = await connection.manager.find(Tag, {
			where: { organization: organization }
		});
		const organizationContacts = await connection.manager.find(
			OrganizationContact,
			{ where: { organizationId: organization.id } }
		);
		for (let i = 0; i < noOfInvoicePerOrganization; i++) {
			const invoice = new Invoice();
			invoice.tags = _.chain(tags)
				.shuffle()
				.take(faker.datatype.number({ min: 1, max: 3 }))
				.values()
				.value();
			invoice.invoiceDate = faker.date.past(0.2);
			invoice.invoiceNumber = faker.datatype.number({
				min: 1,
				max: 9999999
			});
			invoice.dueDate = faker.date.recent(50);
			if (organizationContacts.length) {
				invoice.organizationContactId = faker.random.arrayElement(
					organizationContacts
				).id;
			}
			invoice.sentTo = organization.id;
			invoice.fromOrganization = organization;
			invoice.toContact = faker.random.arrayElement(organizationContacts);
			invoice.currency = organization.currency;
			invoice.discountValue = faker.datatype.number({
				min: 1,
				max: 10
			});
			invoice.paid = faker.datatype.boolean();
			invoice.tax = faker.datatype.number({ min: 1, max: 10 });
			invoice.tax2 = faker.datatype.number({ min: 1, max: 10 });
			invoice.terms = 'Term and Setting Applied';
			invoice.isEstimate = faker.datatype.boolean();
			if (invoice.isEstimate) {
				invoice.isAccepted = faker.datatype.boolean();
			}
			invoice.discountType = faker.random.arrayElement(
				Object.values(DiscountTaxTypeEnum)
			);
			invoice.taxType = faker.random.arrayElement(
				Object.values(DiscountTaxTypeEnum)
			);
			invoice.tax2Type = faker.random.arrayElement(
				Object.values(DiscountTaxTypeEnum)
			);
			invoice.invoiceType = faker.random.arrayElement(
				Object.values(InvoiceTypeEnum)
			);
			invoice.organizationId = organization.id;
			invoice.status = faker.random.arrayElement(
				Object.values(InvoiceStatusTypesEnum)
			);
			invoice.totalValue = faker.datatype.number(99999);
			invoice.tenant = tenant;
			invoice.isArchived = false;
			invoices.push(invoice);
		}
		await connection.manager.save(invoices);
	}
};

export const createRandomInvoice = async (
	connection: Connection,
	tenants: ITenant[],
	tenantOrganizationsMap: Map<ITenant, IOrganization[]>,
	noOfInvoicePerOrganization: number
) => {
	for (const tenant of tenants) {
		const organizations = tenantOrganizationsMap.get(tenant);
		for (const organization of organizations) {
			const invoices: Invoice[] = [];
			const tags = await connection.manager.find(Tag, {
				where: { organization: organization }
			});
			const organizationContacts = await connection.manager.find(
				OrganizationContact,
				{ where: { organizationId: organization.id } }
			);
			for (let i = 0; i < noOfInvoicePerOrganization; i++) {
				const invoice = new Invoice();
				// let invoiceItem = faker.random.arrayElement(invoiceItems);
				invoice.tags = _.chain(tags)
					.shuffle()
					.take(faker.datatype.number({ min: 1, max: 3 }))
					.values()
					.value();
				invoice.invoiceDate = faker.date.past(0.2);
				invoice.invoiceNumber = faker.datatype.number({
					min: 1,
					max: 9999999
				});
				invoice.dueDate = faker.date.recent(50);
				if (organizationContacts.length) {
					invoice.organizationContactId = faker.random.arrayElement(
						organizationContacts
					).id;
				}
				invoice.sentTo = organization.id;
				invoice.fromOrganization = organization;
				invoice.toContact = faker.random.arrayElement(
					organizationContacts
				);
				invoice.currency = organization.currency;
				invoice.discountValue = faker.datatype.number({
					min: 1,
					max: 10
				});
				invoice.paid = faker.datatype.boolean();
				invoice.tax = faker.datatype.number({ min: 1, max: 10 });
				invoice.tax2 = faker.datatype.number({ min: 1, max: 10 });
				invoice.terms = 'Term and Setting Applied';
				invoice.isEstimate = faker.datatype.boolean();
				if (invoice.isEstimate) {
					invoice.isAccepted = faker.datatype.boolean();
				}
				invoice.discountType = faker.random.arrayElement(
					Object.values(DiscountTaxTypeEnum)
				);
				invoice.taxType = faker.random.arrayElement(
					Object.values(DiscountTaxTypeEnum)
				);
				invoice.tax2Type = faker.random.arrayElement(
					Object.values(DiscountTaxTypeEnum)
				);
				invoice.invoiceType = faker.random.arrayElement(
					Object.values(InvoiceTypeEnum)
				);
				invoice.organizationId = organization.id;
				invoice.status = faker.random.arrayElement(
					Object.values(InvoiceStatusTypesEnum)
				);
				invoice.totalValue = faker.datatype.number(99999);
				invoice.tenant = tenant;
				invoices.push(invoice);
			}
			await connection.manager.save(invoices);
		}
	}
};
