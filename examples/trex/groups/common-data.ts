export const numberGroupSuccessStrings = [
	"123,12",
	"12,567",
	"1,567",
	"1,567,8",
	"1,567,89",
	"1,567,890",
	"123,567,890",
	"123,567,890,321",
	"1,567,890,321",
	"1,567,890,3",
	"123",
	"12",
	"1",
];

export const numberGroupFailStrings = [
	"1234->unhandled case",
	"123,567,890,321,123->over match",
	"1,567,890,321,123->over match",
	"123,567,890,321,3->over match",
	"1,567,890,321,3->over match",
	"123,12,->incomplete match",
	"123,123,->incomplete match",
	"1234,123->sub group overmatch",
	"123,1234->sub group overmatch",
];
